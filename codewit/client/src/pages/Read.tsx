import {
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import { Editor } from '@monaco-editor/react';
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { AttemptResult, DemoResponse } from 'lib/shared/interfaces';
import { ButtonHTMLAttributes, useState } from 'react';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Resizable } from 're-resizable';

import NotFound from '../components/notfound/NotFound';
import { AttemptWithEval } from '../interfaces/evaluation';
import CodeSubmission from '../components/codeblock/CodeSubmission';
import Loading from '../components/loading/LoadingPage';
import HelpfulLinks from '../components/videoui/HelpfulLinks';
import VideoPlayer from '../components/videoui/VideoPlayer';
import VideoHeader from '../components/videoui/VideoHeader';
import AuthorTags from '../components/videoui/AuthorTags';
import RelatedDemos from '../components/videoui/RelatedDemos';
import type { EvaluationResponse } from '../interfaces/evaluation';
import { cn } from '../utils/styles';
import { ErrorView } from '../components/error/Error';
import { fetchExercisesByIds } from '../hooks/useExercise';

function demo_query_key(demo_uid: string): ["demo_attempt", string] {
  return ["demo_attempt", demo_uid];
}

export default function Read() {
  const { uid } = useParams<{ uid: string }>();

  if (uid == null) {
    throw new Error("missing demo uid");
  }

  const {data, isLoading, error} = useQuery({
    queryKey: demo_query_key(uid),
    queryFn: async ({queryKey}) => {
      let result = await axios.get<DemoResponse>(`/api/demos/${queryKey[1]}`);

      return result.data;
    }
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error != null) {
    if (error instanceof AxiosError) {
      if (error.response != null) {
        switch (error.response.status) {
          case 404:
            return <NotFound />;
          case 500:
            return <ErrorView title="Server Error">
              <p className="text-lg">There was a server error when retrieving data for this page.</p>;
            </ErrorView>;
          default:
            return <ErrorView>
              <p className="text-lg">There was a problem loading this page.</p>
            </ErrorView>;
        }
      } else {
        return <ErrorView>
          <p className="text-lg">There was a problem loading this page.</p>
        </ErrorView>;
      }
    } else {
      return <ErrorView>
        <p className="text-lg">There was a problem loading this page.</p>
      </ErrorView>;
    }
  }

  if (data == null) {
    return <ErrorView title="No Data">
      <p className="text-lg">There was no data to load for this page.</p>
    </ErrorView>;
  }

  return (
    <div className="h-container-full w-full overflow-auto flex flex-col md:flex-row bg-black">
      <LeftPanel demo={data}/>
      <RightPanel demo={data}/>
    </div>
  );
}

interface LeftPanelProps {
  demo: DemoResponse,
}

function LeftPanel({demo}: LeftPanelProps) {
  const {mutate} = useMutation({
    mutationFn: async (uid: number) => {
      let result = await axios.post(`/api/demos/${uid}/like`);
    },
    onError: (err, vars, cxt) => {
      console.error("error liking demo:", err);
    }
  });

  return <Resizable
    defaultSize={{width: '60%', height: '100%'}}
    maxWidth="65%"
    minWidth="30%"
    enable={{ right: true }}
    className="pl-2 pt-2 pr-5 font-white"
    handleClasses={{
      right: 'h-full flex items-center justify-center bg-foreground-700 hover:bg-foreground-400 transition-colors duration-200',
    }}
    handleComponent={{
      right: <div className="group flex flex-col items-center justify-center">
        <EllipsisVerticalIcon className="h-[30px] w-[30px] z-10 text-foreground-200 rounded-full hover:bg-foreground-400 transition-colors"/>
      </div>,
    }}
  >
    <div className="w-full h-full">
      <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
      <div className="ml-2">
        <VideoHeader
          title={demo.title}
          uid={demo.uid}
          handleClick={mutate}
        />
        <AuthorTags tags={demo.tags} />
        <div className="mt-4 h-[26vh] overflow-y-auto">
          <RelatedDemos />
          <HelpfulLinks />
        </div>
      </div>
    </div>
  </Resizable>;
}

enum SubmissionState {
  Submit = 0,
  Next = 1,
  Finished = 2,
};

type AttemptResponse = AttemptResult & {
  evaluation: EvaluationResponse;
};

interface RightPanelProps {
  demo: DemoResponse,
}

function RightPanel({demo}: RightPanelProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [exercise_index, set_exercise_index] = useState(0);
  const [last_attempt, set_last_attempt] = useState<AttemptWithEval | null>(null);
  const [submission_state, set_submission_state] = useState<SubmissionState>(SubmissionState.Submit);

  const activeExerciseId = demo.exercises[exercise_index];

  const { data: exerciseDetails, isLoading: isExerciseLoading } = useQuery({
    queryKey: ['exercise', activeExerciseId],
    queryFn: () => fetchExercisesByIds([activeExerciseId]).then(res => res[0]),
    enabled: !!activeExerciseId,
  });

  const {mutateAsync, isPending} = useMutation({
    mutationFn: async (code: string) => {
      const exerciseId = demo.exercises[exercise_index];

      const { data } = await axios.post<AttemptResponse>(
        "/api/attempts",
        {
          timestamp: new Date(),
          exerciseId,
          code,
        },
        { withCredentials: true }
      );

      return data;
    },
    onSuccess: (data, vars, ctx) => {
      if (data.attempt.completionPercentage === 100) {
        if (exercise_index === demo.exercises.length - 1) {
          set_submission_state(SubmissionState.Finished);
        } else {
          set_submission_state(SubmissionState.Next);
        }
      }

      // keep full result so CodeSubmission can render eval / stdout
      set_last_attempt({
        attempt: data.attempt,
        evaluation: data.evaluation,
      });
    },
    onError: (err, vars, ctx) => {
      console.error('Error submitting code:', err);

      set_last_attempt({
        attempt   : null,
        evaluation: {
          state : 'error',
          error : 'Unexpected error: ' + err.message,
        },
      } as AttemptWithEval);
    }
  });

  const form = useForm({
    defaultValues: {
      code: exerciseDetails?.starterCode ?? ""
    },
    onSubmit: async ({value}) => {
      await mutateAsync(value.code);
    }
  });

  let action_btn;

  switch (submission_state) {
    case SubmissionState.Submit:
      if (isPending) {
        action_btn = <ActionBtn
          type="button"
          disabled
          className="bg-alternate-background-500 border-foreground-400 hover:bg-alternate-background-500/90"
        >
          <img className="h-[24px] w-[24px]" src ="/processing-cog.svg" alt="cog loader svg for submission"/>
          <span data-testid="submit-button-checking" className="text-accent-500 font-bold">
            Checking...
          </span>
        </ActionBtn>;
      } else {
        action_btn = <ActionBtn
          type="submit"
          className="border-accent-500"
        >
          <CheckIcon className="w-6 h-6 text-accent-500 group-hover:text-accent-600" />
          <span data-testid="submit-button" className="text-accent-500 group-hover:text-accent-600">
            Submit
          </span>
        </ActionBtn>;
      }
      break;
    case SubmissionState.Next:
      action_btn = <ActionBtn
        type="button"
        className="border-accent-500"
        onClick={() => {
          set_exercise_index(i => (i + 1));
          set_submission_state(SubmissionState.Submit);

          form.resetField("code");
        }}
      >
        <CheckIcon className="w-6 h-6 text-accent-500 group-hover:text-accent-600" />
        <span data-testid="submit-button" className="text-accent-500 group-hover:text-accent-600">
          Next Exercise
        </span>
      </ActionBtn>
      break;
    case SubmissionState.Finished:
      action_btn = <ActionBtn
        type="button"
        className="border-accent-500 bg-green-500"
        onClick={() => {
          let course_id = new URL(location.pathname + location.search, window.location.origin)
            .searchParams
            .get("course_id");

          navigate(`/${course_id ?? ""}`);
        }}
      >
        <CheckIcon className="w-6 h-6 text-alternate-background-700" />
        <span data-testid="submit-button" className="text-alternate-background-700">
          Finished
        </span>
      </ActionBtn>
      break;
  }

  return <div className="flex-1 h-full w-full md:overflow-hidden pt-2 flex flex-col">
    <div className="pb-2 px-2">
      <h3 className="font-semibold text-lg bg-accent-700 text-white py-2 px-3 rounded-lg">
        Exercise {exercise_index + 1}
      </h3>
    </div>
    <Resizable
      defaultSize={{width: '100%', height: '60%'}}
      minHeight="30%"
      maxHeight="70%"
      enable={{bottom: true}}
      handleClasses={{
        bottom: 'w-full flex items-center justify-center bg-foreground-700 hover:bg-foreground-400 transition-colors duration-200',
      }}
      handleComponent={{
        bottom: <div className="group w-full h-full flex items-center justify-center">
          <EllipsisHorizontalIcon className="h-[30px] w-[30px] text-foreground-200 rounded-full hover:bg-foreground-400 transition-colors"/>
        </div>,
      }}
    >
      <form className="flex-1 flex flex-col h-full px-2" onSubmit={e => {
        e.preventDefault();

        form.handleSubmit();
      }}>
        <form.Field name="code" children={(field) => {
          return <Editor
            value={field.state.value}
            language={demo.language}
            theme="hc-black"
            className="border-2 rounded-lg border-gray-800 focus-within:border-accent-500 overflow-hidden"
            wrapperProps={{
              // this is needed to properly resize the editor otherwise it only resize when the handle reaches
              // the bottom of the editor which would hide the buttons
              className: "overflow-hidden"
            }}
            onChange={(v) => field.handleChange(v ?? "")}
          />;
        }}/>
        <div className="flex flex-row gap-1 pt-2 pb-3">
          <ActionBtn type="button" className="w-1/3 border-accent-500" disabled={isPending} onClick={() => form.resetField("code")}>
            <ArrowPathIcon className="w-6 h-6 mr-2 text-accent-500 group-hover:text-accent-600" />
            <span data-testid="reset-button" className="text-accent-500 group-hover:text-accent-600">Reset</span>
          </ActionBtn>
          {action_btn}
        </div>
      </form>
    </Resizable>
    <div className="flex-1 overflow-y-auto mt-2 px-2">
      {last_attempt && (
        <CodeSubmission evaluation={last_attempt.evaluation || null} />
      )}
    </div>
  </div>;
}

type ActionBtnProps = ButtonHTMLAttributes<HTMLButtonElement>;

function ActionBtn({className, children, ...rest}: ActionBtnProps) {
  return <button
    className={cn(
      "group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 rounded-lg focus:outline-none w-2/3",
      className
    )}
    {...rest}
  >
    {children}
  </button>
}