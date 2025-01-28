// codewit/client/src/pages/Read.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../components/notfound/NotFound';
import CodeBlock from "../components/codeblock/Codeblock";
import { DemoResponse, Demo as DemoType } from '@codewit/interfaces';
import Checklist from "../components/codeblock/Checklist";
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
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';


const Read = (): JSX.Element => {
  const { uid } = useParams<{ uid: string }>();
  const { data: demo, loading, error } = useFetchSingleDemo(uid!) as unknown as { data: DemoResponse, loading: boolean, error: boolean };
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [relatedDemosOpen, setRelatedDemosOpen] = useState<boolean>(false);
  const [helpfulLinksOpen, setHelpfulLinksOpen] = useState<boolean>(false);
  const showBorder: boolean = relatedDemosOpen || helpfulLinksOpen;

  if (loading) {
    return <Loading />;
  }

  if (error || !demo) {
    return <NotFound />;
  }

  // const [isMdScreen, setIsMdScreen] = useState<boolean>(window.innerWidth >= 768);
  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMdScreen(window.innerWidth >= 768);
  //   };
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  const handleSubmission = async (code: string) => {
    if (!demo) return;

    const userId = localStorage.getItem('userId');
    const submission = {
      timestamp: new Date().toISOString(),
      userId: userId,
      exerciseId: demo.exercises[currentExerciseIndex],
      code: code,
    };

    try {
      await axios.post('/attempts', submission);
      const isSuccess = true; 
      if (isSuccess) {
        setCurrentExerciseIndex((prevIndex) => prevIndex + 1 < demo.exercises.length ? prevIndex + 1 : prevIndex);
      }
    } catch (e) {
      console.error('Error submitting code:', e);
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
    <div className="h-container-full overflow-auto flex flex-col md:flex-row w-full bg-zinc-900">
      {/* left side */}
      <Resizable
        defaultSize={{
          width: "60%",
          height: "100%",
        }}
        maxWidth="65%"
        minWidth="30%"
        enable={{ right: true }}
        className="overflow-x-hidden overflow-y-hidden pl-2 pt-2 pr-5 font-white"
        handleClasses={{
          right: "h-full flex items-center justify-center bg-foreground-700",
        }}
        handleComponent={{
          right: (
            <div className='mr-[5px] w-[5px] h-16 rounded-full bg-foreground-500 hover:bg-foreground-400'>
              <div className="flex flex-col items-center justify-center mt-[18px]">
                <EllipsisVerticalIcon 
                  className="h-6 w-6"
                />
              </div>
            </div>
          ),
        }}
      >
        {demo && (
          <div className="w-full h-full">
            <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
            <div className='ml-2'>
              <VideoHeader title={demo.title} uid={demo.uid} handleClick={likeVideo} />
              <AuthorTags 
                tags={demo.tags}
              />
                <div className={`mt-1 h-36 overflow-y-auto flex-grow ${showBorder ? 'border-2 border-gray-600 border-dashed rounded-md' : ''}`}>
                  <RelatedDemos setRelatedDemosOpen={setRelatedDemosOpen}/>
                  <HelpfulLinks setHelpfulLinksOpen={setHelpfulLinksOpen}/>
                </div>
            </div>
          </div>
        )}
      </Resizable>

      {/* right side */}
      <div className="flex-1 h-full w-full md:overflow-auto pt-2 px-2 flex flex-col gap-2">
        <Exercises exercises={demo.exercises} idx={currentExerciseIndex} />
        <CodeBlock onSubmit={handleSubmission} />
        <Checklist />
      </div>
    </div>
  );
};

export default Read;