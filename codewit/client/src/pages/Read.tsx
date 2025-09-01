import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import {
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  PlayIcon,
  CheckCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/solid';
import { Editor } from '@monaco-editor/react';
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { AttemptResult, DemoAttempt, DemoResource, RelatedDemo } from 'lib/shared/interfaces';
import { ButtonHTMLAttributes, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Resizable } from 're-resizable';

import NotFound from '../components/notfound/NotFound';
import { AttemptWithEval } from '../interfaces/evaluation';
import CodeSubmission from '../components/codeblock/CodeSubmission';
import Loading from '../components/loading/LoadingPage';
import VideoPlayer from '../components/videoui/VideoPlayer';
import type { EvaluationResponse } from '../interfaces/evaluation';
import { cn } from '../utils/styles';
import { ErrorView } from '../components/error/Error';
import { toast } from 'react-toastify';
import { DefaultMarkdown } from '../components/markdown';

function demo_query_key(demo_uid: string, module_id: string | null): ["demo_attempt", string, string | null] {
  return ["demo_attempt", demo_uid, module_id];
}

export default function Read() {
  const { uid } = useParams<{ uid: string }>();
  const [search_params, set_search_params] = useSearchParams();

  const module_id = search_params.get("module_id");
  const course_id = search_params.get("course_id");

  if (uid == null) {
    throw new Error("missing demo uid");
  }

  const {data, isLoading, error} = useQuery({
    queryKey: demo_query_key(uid, module_id),
    queryFn: async ({queryKey}) => {
      let path = `/api/demos/${queryKey[1]}/attempt?`;

      if (queryKey[2] != null) {
        path += `module_id=${queryKey[2]}`;
      }

      let result = await axios.get<DemoAttempt>(path);

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
    <div className="h-full w-full overflow-auto flex flex-col md:flex-row bg-black">
      <LeftPanel info={data} module_id={module_id} course_id={course_id}/>
      {data.demo.exercises.length === 0 ?
        <div className="flex flex-col items-center justify-center w-full">
          <h3 className="text-xl">No Exercises</h3>
          <p>There are no exercises attached to this demo</p>
        </div>
        :
        <RightPanel info={data} course_id={course_id}/>
      }
    </div>
  );
}

interface LeftPanelProps {
  info: DemoAttempt,
  module_id: string | null,
  course_id: string | null
}

function LeftPanel({info, module_id, course_id}: LeftPanelProps) {
  let [is_liked, set_is_liked] = useState(info.demo.liked);

  const {mutate} = useMutation<void, Error, {uid: number, like_demo: boolean}>({
    mutationFn: async ({uid, like_demo}) => {
      let path = `/api/demos/${uid}/like`;

      if (like_demo) {
        await axios.post(path);
      } else {
        await axios.delete(path);
      }
    },
    onSuccess: (data, {like_demo}, ctx) => {
      set_is_liked(like_demo);
    },
    onError: (err, vars, cxt) => {
      console.error("error liking demo:", err);

      if (err instanceof AxiosError) {
        if (err.response != null) {
          switch (err.response.status) {
            case 404:
              toast.error("Failed to update demo like: DemoNotFound");
              break;
            case 500:
              toast.error("Failed to update demo like: ServerError");
              break;
            default:
              toast.error("Filaed to udpate demo like");
              break;
          }
        } else {
          toast.error("Failed to update demo like: ClientError");
        }
      } else {
        toast.error("Failed to update demo like: ClientError");
      }
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
    <div className="w-full h-full flex flex-col">
      <VideoPlayer youtube_id={info.demo.youtube_id} title={info.demo.title} />
      <div className="flex justify-between items-center pl-2 mt-4">
        <h2 data-testid="demo-title" className="text-3xl font-bold text-white">{info.demo.title}</h2>
        <button
          onClick={() => mutate({uid: info.demo.uid, like_demo: !is_liked})}
          type="button"
          data-testid="like-button"
          className={cn(
            "group px-2 py-1 text-md font-medium text-center flex items-center rounded-lg border-2 hover:bg-accent-400 focus:outline-none",
            {"text-green-500 border-green-500": is_liked},
            {"text-accent-400 border-accent-400": !is_liked}
          )}
        >
          {is_liked ?
            <HandThumbUpIcon className="w-6 h-6 mr-2 group-hover:text-white" />
            :
            <HandThumbUpIcon className="w-6 h-6 mr-2 group-hover:text-white" />
          }
          <span  className="group-hover:text-white">Like</span>
        </button>
      </div>
      <div className="pl-2 mt-2 flex items-center space-x-2 text-white">
        {/*
        // we have a way of specifying who the presenter is for the video
        // then this can be used
        <span className = "inline-flex justify-center items-center gap-1 text-lg font-medium"> 
          by 
          <UserCircleIcon className="w-7 h-7" />
          Jessica
        </span>
        */}
        {info.demo.tags.map(tag => (
          <span key={tag} data-testid="author-tags" className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">{tag}</span>
        ))}
      </div>
      <div className="pl-2 flex-1 mt-4 overflow-y-auto">
        <RelatedDemos demos={info.related_demos} module_id={module_id} course_id={course_id}/>
        <HelpfulLinks links={info.resources}/>
      </div>
    </div>
  </Resizable>;
}

interface RelatedDemosProps {
  demos: RelatedDemo[] | null,
  course_id?: string | null,
  module_id?: string | null,
}

function RelatedDemos({demos, course_id, module_id}: RelatedDemosProps) {
  if (demos == null || demos.length === 0) {
    return null;
  }

  return <details data-testid="related-demos" className="font-bold rounded-lg w-full text-white flex flex-col overflow-hidden group mb-4 border border-gray-800">
    <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-accent-500/10 transition-all rounded-lg">
      <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-90" />
      <span className="text-base">Related Demos</span>
    </summary>
    <div className="px-2 py-3">
      <div className="flex overflow-x-auto gap-3 pb-2">
        {demos.map(demo => {
          let link_path = `/read/${demo.uid}?`;

          if (course_id != null) {
            link_path += `course_id=${course_id}&`;
          }

          if (module_id != null) {
            link_path += `module_id=${module_id}`;
          }

          let status = null;

          if (demo.completion !== 0 && demo.completion !== 1) {
            status = `${(demo.completion * 100).toFixed(0)}%`;
          }

          return <Link
            key={demo.uid}
            to={link_path}
            className="flex-shrink-0 w-48 rounded-md overflow-hidden hover:shadow-lg transition-all duration-200 group/link border border-gray-800 hover:border-accent-500/50"
          >
            <div className="relative w-full h-28 overflow-hidden">
              <img src={demo.youtube_thumbnail} alt={demo.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover/link:bg-opacity-20 transition-all">
                {demo.completion === 1 ?
                  <CheckCircleIcon className="h-8 w-8 text-green-500"/>
                  :
                  <div className="flex flex-row items-center gap-2">
                    {status}
                    <PlayIcon className="h-8 w-8 text-white" />
                  </div>
                }
              </div>
            </div>
            <div className="p-2">
              <h3 className="text-sm font-medium text-white group-hover/link:text-accent-400 transition-colors truncate">
                {demo.title}
              </h3>
            </div>
          </Link>
        })}
      </div>
    </div>
  </details>;
};

interface HelpfulLinksProps {
  links: DemoResource[] | null
}

function HelpfulLinks({links}: HelpfulLinksProps) {
  if (links == null || links.length === 0) {
    return null;
  }

  return <details data-testid="helpful-links" className="font-bold rounded-lg w-full text-white flex flex-col overflow-hidden group mb-4 border border-gray-800">
    <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-accent-500/10 transition-all rounded-lg">
      <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-90" />
      <span className="text-base">Helpful Links</span>
    </summary>
    <div className="flex flex-col px-2 py-2 space-y-2">
      {links.map(link => (
        <a
          key={link.uid}
          href={link.url}
          target="_blank"
          className="flex items-center p-2 rounded-md hover:bg-gray-800/50 transition-all duration-200 group/link hover:border-accent-500/30"
        >
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-white group-hover/link:text-accent-400 transition-colors">
              {link.title}
            </h3>
          </div>
          <div className="flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity">
            <LinkIcon className="w-4 h-4 text-accent-400" />
          </div>
        </a>
      ))}
    </div>
  </details>;
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
  info: DemoAttempt,
  course_id: string | null,
}

function RightPanel({info, course_id}: RightPanelProps) {
  const navigate = useNavigate();

  const [exercise_index, set_exercise_index] = useState(0);
  const [last_attempt, set_last_attempt] = useState<AttemptWithEval | null>(null);
  const [submission_state, set_submission_state] = useState<SubmissionState>(SubmissionState.Submit);

  const {mutateAsync, isPending} = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await axios.post<AttemptResponse>(
        "/api/attempts",
        {
          timestamp: new Date(),
          exerciseId: info.demo.exercises[exercise_index].uid,
          code,
        },
        { withCredentials: true }
      );

      return data;
    },
    onSuccess: (data, vars, ctx) => {
      if (data.attempt.completionPercentage === 100) {
        if (exercise_index === info.demo.exercises.length - 1) {
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
          error : 'Unexpected error: ' + err?.message,
        },
      } as AttemptWithEval);
    }
  });

  const form = useForm({
    defaultValues: {
      code: info.demo.exercises[exercise_index].skeleton ?? ""
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
        action_btn = <ActionBtn type="submit" className="border-accent-500">
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
        onClick={e => {
          e.preventDefault();

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
        onClick={() => navigate(`/${course_id ?? ""}`)}
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
      <div className="px-2 h-full overflow-auto">
        <div className="w-full space-y-2">
          <DefaultMarkdown text={info.demo.exercises[exercise_index].prompt}/>
        </div>
        <form className="flex-1 flex flex-col h-full mt-2" onSubmit={e => {
          e.preventDefault();

          form.handleSubmit();
        }}>
          <form.Field name="code" children={(field) => {
            return <Editor
              value={field.state.value}
              language={info.demo.exercises[exercise_index].language}
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
      </div>
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