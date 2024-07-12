import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DemoResponse, Demo as DemoType } from '@codewit/interfaces';
import NotFound from '../components/notfound/NotFound';
import CodeBlock from "../components/codeblock/Codeblock";
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
import { useFetchSingleDemo } from '../hooks/demohooks/useDemoHooks';

const Read = (): JSX.Element => {
  const [isMdScreen, setIsMdScreen] = useState<boolean>(window.innerWidth >= 768);
  const { uid } = useParams<{ uid: string }>();
  const { demo, loading, error } = useFetchSingleDemo(uid!);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMdScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const likeVideo = async (uid: number) => {
    try {
      await axios.post(`/demos/${uid}/like`);
    } catch (error) {
      console.error('Error liking the video:', error);
    }
  }

  const handleSubmission = async (code: string) => {
    const userId = localStorage.getItem('userId');
    const submission = {
      timestamp: new Date().toISOString(),
      userId: userId,
      exerciseId: demo?.exercises[currentExerciseIndex].uid,
      code: code,
    };

    const isSuccess = true; 

    if (isSuccess) {
      setCurrentExerciseIndex((prevIndex) => {
        if (demo && prevIndex < demo.exercises.length - 1) {
          return prevIndex + 1;
        } else {
          return prevIndex;
        }
      });
    }

    console.log('Attempt:', submission);
  }

  if (error) {
    return <NotFound />;
  }

  if (loading) {
    return <Loading />;
  }

  const resizableContent = (
    <Resizable
      defaultSize={{
        width: "70%",
        height: "100%",
      }}
      maxWidth="65%"
      minWidth="30%"
      enable={{ right: true, left: true }}
      className="overflow-x-hidden overflow-y-auto p-4 bg-zinc-900 font-white border-r-2 border-zinc-800"
      handleStyles={{
        left: { left: '-5px' },
        right: { right: '-5px' }
      }}
    >
      {demo && (
        <div className="space-y-4 w-full h-full">
          <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
          <VideoHeader title={demo.title} uid={demo.uid} handleClick={likeVideo} />
          <AuthorTags 
            tags={demo.tags}
          />
          <RelatedDemos />
          <HelpfulLinks />
        </div>
      )}
    </Resizable>
  );

  const nonResizableContent = (
    <div className="p-4 bg-zinc-900 font-white w-full h-full">
      <div className="space-y-4">
        {demo && (
          <>
            <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
            <VideoHeader title={demo.title} uid={demo.uid} handleClick={likeVideo} />
          </>
        )}
        <AuthorTags 
          tags={demo?.tags}
        />
        <RelatedDemos />
        <HelpfulLinks />
      </div>
    </div>
  );

  return (
    <div className="h-container-full overflow-auto flex flex-col md:flex-row w-full bg-zinc-900">
      {isMdScreen ? resizableContent : nonResizableContent}
      <div className="flex-1 h-full w-full md:overflow-auto p-4 flex flex-col gap-2">
        {demo && <Exercises exercises={demo.exercises} />}
        <CodeBlock 
          onSubmit={handleSubmission}
        />
        <Checklist />
      </div>
    </div>
  );
};

export default Read;
