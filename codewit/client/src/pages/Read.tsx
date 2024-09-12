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

const Read = (): JSX.Element => {
  const { uid } = useParams<{ uid: string }>();
  const { data: demo, loading, error } = useFetchSingleDemo(uid!) as unknown as { data: DemoResponse, loading: boolean, error: boolean };
  const [isMdScreen, setIsMdScreen] = useState<boolean>(window.innerWidth >= 768);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMdScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const likeVideo = async (uid: number) => {
    try {
      await axios.post(`/demos/${uid}/like`);
    } catch (error) {
      console.error('Error liking the video:', error);
    }
  };

  const handleSubmission = async (code: string) => {
    if (!demo) return;

    const userId = localStorage.getItem('userId');
    const submission = {
      timestamp: new Date().toISOString(),
      userId: userId,
      exerciseId: demo.exercises[currentExerciseIndex].uid,
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

  if (loading) {
    return <Loading />;
  }

  if (error || !demo) {
    return <NotFound />;
  }

  const renderContent = () => (
    <>
      <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
      <VideoHeader title={demo.title} uid={demo.uid} handleClick={() => likeVideo(demo.uid)} />
      <AuthorTags tags={demo.tags} />
      <RelatedDemos />
      <HelpfulLinks />
    </>
  );

  return (
    <div className="h-container-full overflow-auto flex flex-col md:flex-row w-full bg-zinc-900">
      {isMdScreen ? (
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
          <div className="space-y-4 w-full h-full">
            {renderContent()}
          </div>
        </Resizable>
      ) : (
        <div className="p-4 bg-zinc-900 font-white w-full h-full">
          <div className="space-y-4">
            {renderContent()}
          </div>
        </div>
      )}
      <div className="flex-1 h-full w-full md:overflow-auto p-4 flex flex-col gap-2">
        <Exercises exercises={demo.exercises} idx={currentExerciseIndex} />
        <CodeBlock onSubmit={handleSubmission} />
        <Checklist />
      </div>
    </div>
  );
};

export default Read;