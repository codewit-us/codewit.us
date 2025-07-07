// codewit/client/src/pages/Read.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../components/notfound/NotFound';
import CodeBlock from '../components/codeblock/Codeblock';
import { AttemptWithEval } from '../interfaces/evaluation';
import {
  DemoResponse,
  Demo,
  ExerciseResponse,
} from '@codewit/interfaces';
import CodeSubmission from '../components/codeblock/CodeSubmission';
import { AttemptResult } from 'lib/shared/interfaces';
import Loading from '../components/loading/LoadingPage';
import HelpfulLinks from '../components/videoui/HelpfulLinks';
import Exercises from '../components/codeblock/Exercises';
import useExercisesByIds from '../hooks/useExercisesByIds';
import axios from 'axios';
import { Resizable } from 're-resizable';
import VideoPlayer from '../components/videoui/VideoPlayer';
import VideoHeader from '../components/videoui/VideoHeader';
import AuthorTags from '../components/videoui/AuthorTags';
import RelatedDemos from '../components/videoui/RelatedDemos';
import { useFetchSingleDemo } from '../hooks/useDemo';
import { useFetchStudentCourses } from '../hooks/useCourse';
import {
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/solid';
import type { EvaluationResponse } from '../interfaces/evaluation';


const Read = (): JSX.Element => {
  const [lastAttemptResult, setLastAttemptResult] = useState<AttemptWithEval | null>(null);
  const { uid } = useParams<{ uid: string }>();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);
  
  const {
    data: studentCourses,
    setData: setStudentCourses,
    loading: courseLoading,
    error: courseError,
  } = useFetchStudentCourses();

  const {
    data   : demo,
    loading: demoLoading,
    error  : demoError,
  } = useFetchSingleDemo(uid!);

  const {
    data   : exerciseObjs,
    loading: exLoading,
    error  : exError,
  } = useExercisesByIds(demo?.exercises ?? []);
 
  const exercisesReady = !exLoading && !exError;

  type AttemptResponse = AttemptResult & {
    evaluation: EvaluationResponse;
  };

  const handleSubmission = async (code: string) => {
    if (!demo) return;
    const exerciseId = demo.exercises[currentExerciseIndex];
    setIsSubmitting(true);

    const submission = {
      timestamp : new Date().toISOString(),
      exerciseId: demo.exercises[currentExerciseIndex],
      code,
    };

    try {
      // ---------- send attempt ----------
      const { data: result } = await axios.post<AttemptResponse>(
        '/attempts',
        {
          timestamp : new Date().toISOString(),
          exerciseId,
          code,
        },
        { withCredentials: true }
      );

      if (result.updatedModules?.length) {
        setStudentCourses(prev => {
          if (!prev?.length) return prev;
          const next   = structuredClone(prev);
          const course = next[0];
          if (!course) return prev;

          result.updatedModules.forEach(({ moduleUid, completion }) => {
            const m = course.modules.find(m => m.uid === moduleUid);
            if (m) m.completion = completion;
          });
          return next;
        });
      }

      if (result.attempt?.completionPercentage === 100) {
        setCurrentExerciseIndex(i =>
          Math.min(i + 1, demo.exercises.length - 1)
        );
      }

      // keep full result so CodeSubmission can render eval / stdout
      const attemptWithEval: AttemptWithEval = {
        attempt   : result.attempt,
        evaluation: result.evaluation,
      };

      setLastAttemptResult(attemptWithEval);

    } catch (err: any) {
      console.error('Error submitting code:', err);
      setLastAttemptResult({
        attempt   : null,
        evaluation: {
          state : 'error',
          error : 'Unexpected error: ' + err?.message,
        },
      } as AttemptWithEval);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const likeVideo = async (uid: number) => {
    try {
      await axios.post(`/demos/${uid}/like`);
    } catch (error) {
      console.error('Error liking the video:', error);
    }
  };

  if (demoLoading || courseLoading) {
     return <Loading />;
   }

  if (demoError || courseError || !demo) {
     return <NotFound />;
   }

  return (
    <div className="h-container-full overflow-auto flex flex-col md:flex-row w-full bg-black">

      {/* left side */}
      <Resizable
        defaultSize={{
          width: '60%',
          height: '100%',
        }}
        maxWidth="65%"
        minWidth="30%"
        enable={{ right: true }}
        className="overflow-x-hidden overflow-y-hidden pl-2 pt-2 pr-5 font-white"
        handleClasses={{
          right:
            'h-full flex items-center justify-center bg-foreground-700 hover:bg-foreground-400 transition-colors duration-200',
        }}
        handleComponent={{
          right: (
            <div className="group mr-[5px] w-[5px] h-16">
              <div className="flex flex-col items-center justify-center mt-[18px]">
                <EllipsisVerticalIcon className="h-[30px] w-[30px] text-foreground-200" />
              </div>
            </div>
          ),
        }}
      >
        {demo && (
          <div className="w-full h-full">
            <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
            <div className="ml-2">
              <VideoHeader
                title={demo.title}
                uid={demo.uid}
                handleClick={likeVideo}
              />
              <AuthorTags tags={demo.tags} />
              <div className="mt-4 h-[26vh] overflow-y-auto">
                <RelatedDemos />
                <HelpfulLinks />
              </div>
            </div>
          </div>
        )}
      </Resizable>

      {/* right side */}
      <div className="flex-1 h-full w-full md:overflow-hidden pt-2 px-2 flex flex-col">
        <div className="mb-2">
          <Exercises
            exercises={exerciseObjs}
            idx={currentExerciseIndex}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Resizable
            defaultSize={{
              width: '100%',
              height: '60%',
            }}
            minHeight="30%"
            maxHeight="70%"
            enable={{ bottom: true }}
            className="overflow-hidden"
            handleClasses={{
              bottom:
                'w-full flex items-center justify-center bg-foreground-700 hover:bg-foreground-400 transition-colors duration-200',
            }}
            handleComponent={{
              bottom: (
                <div className="w-full flex items-center justify-center">
                  <div className="group h-[12px]">
                    <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2">
                      <EllipsisHorizontalIcon className="h-[30px] w-[30px] text-foreground-200" />
                    </div>
                  </div>
                </div>
              ),
            }}
          >
            <CodeBlock
              onSubmit={handleSubmission}
              isSubmitting={isSubmitting}
            />
          </Resizable>

          <div className="flex-1 overflow-y-auto mt-2">
            {lastAttemptResult && (
              <CodeSubmission evaluation={lastAttemptResult.evaluation || null} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Read;
