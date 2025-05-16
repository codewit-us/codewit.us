// codewit/client/src/pages/Read.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../components/notfound/NotFound';
import CodeBlock from '../components/codeblock/Codeblock';
import {
  DemoResponse,
  Demo as DemoType,
  ExerciseResponse,
} from '@codewit/interfaces';
import CodeSubmission from '../components/codeblock/CodeSubmission';
import Loading from '../components/loading/LoadingPage';
import HelpfulLinks from '../components/videoui/HelpfulLinks';
import Exercises from '../components/codeblock/Exercises';
import axios from 'axios';
import { Resizable } from 're-resizable';
import VideoPlayer from '../components/videoui/VideoPlayer';
import VideoHeader from '../components/videoui/VideoHeader';
import AuthorTags from '../components/videoui/AuthorTags';
import RelatedDemos from '../components/videoui/RelatedDemos';
import { useFetchSingleDemo } from '../hooks/useDemo';
import {
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/solid';

const Read = (): JSX.Element => {
  const { uid } = useParams<{ uid: string }>();
  const {
    data: demo,
    loading,
    error,
  } = useFetchSingleDemo(uid!) as unknown as {
    data: DemoResponse;
    loading: boolean;
    error: boolean;
  };
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // const [relatedDemosOpen, setRelatedDemosOpen] = useState<boolean>(false);
  // const [helpfulLinksOpen, setHelpfulLinksOpen] = useState<boolean>(false);
  // const showBorder: boolean = relatedDemosOpen || helpfulLinksOpen;

  if (loading) {
    return <Loading />;
  }

  if (error || !demo) {
    return <NotFound />;
  }

  const handleSubmission = async (code: string) => {
    if (!demo) return;

    const userId = localStorage.getItem('userId');
    const currentExercise = demo.exercises[
      currentExerciseIndex
    ] as unknown as ExerciseResponse;

    const submission = {
      timestamp: new Date().toISOString(),
      userId: userId,
      exerciseId: currentExercise.uid || currentExerciseIndex,
      code: code,
    };

    try {
      setIsSubmitting(true);
      await axios.post('/attempts', submission);
      const isSuccess = true;
      if (isSuccess) {
        setCurrentExerciseIndex((prevIndex) =>
          prevIndex + 1 < demo.exercises.length ? prevIndex + 1 : prevIndex
        );
      }
    } catch (e) {
      console.error('Error submitting code:', e);
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
          <Exercises exercises={demo.exercises} idx={currentExerciseIndex} />
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
            <CodeSubmission />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Read;
