import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Demo as DemoType } from 'client/src/interfaces/demo.interface';
import NotFound from '../components/notfound/notfound';
import CodeBlock from "../components/codeblock/codeblock";
import Checklist from "../components/codeblock/checklist";
import Loading from '../components/loading/loadingPage';
import HelpfulLinks from '../components/videoui/helpfulLinks';
import VideoHeader from '../components/videoui/videoHeader';
import AuthorTags from '../components/videoui/authorTags';
import RelatedDemos from '../components/videoui/relatedDemos';
import VideoPlayer from '../components/videoui/videoPlayer';
import Exercises from '../components/codeblock/exercises';
import axios from 'axios';
import { Resizable } from 're-resizable';

const Read = (): JSX.Element => {
  const [demo, setDemo] = useState<DemoType>();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMdScreen, setIsMdScreen] = useState<boolean>(window.innerWidth >= 768);
  const { uid } = useParams<{ uid: string }>();

  useEffect(() => {
    const handleResize = () => {
      setIsMdScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/demos/${uid}`);
        setDemo(res.data);
        setLoading(false);
      } catch (err) {
        setError(true);
      }  
    }
    fetchVideo();  
  }, [uid]);

  const likeVideo = async (uid: string) => {
    console.log('liking video');
    try {
      await axios.post(`/demos/${uid}/like`);
    } catch (error) {
      console.error('Error liking the video:', error);
    }
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
      maxWidth="90%"
      minWidth="30%"
      enable={{ right: true, left: true }}
      className="overflow-x-hidden overflow-y-auto p-4 bg-zinc-900 font-white border-r-2 border-zinc-800"
      handleStyles={{
        left: { left: '-5px' },
        right: { right: '-5px' }
      }}
    >
      <div className="space-y-4 w-full h-full">
        <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
        <VideoHeader title={demo.title} uid={demo.uid} handleClick={likeVideo} />
        <AuthorTags />
        <RelatedDemos />
        <HelpfulLinks />
      </div>
    </Resizable>
  );

  const nonResizableContent = (
    <div className="p-4 bg-zinc-900 font-white w-full h-full">
      <div className="space-y-4">
        <VideoPlayer youtube_id={demo.youtube_id} title={demo.title} />
        <VideoHeader title={demo.title} uid={demo.uid} handleClick={likeVideo} />
        <AuthorTags />
        <RelatedDemos />
        <HelpfulLinks />
      </div>
    </div>
  );

  return (
    <div className="h-container-full overflow-auto flex flex-col md:flex-row w-full bg-zinc-900">
      {isMdScreen ? resizableContent : nonResizableContent}
      <div className="flex-1 h-full w-full md:overflow-auto p-4 flex flex-col gap-2">
        <Exercises exercises={demo.exercises} />
        <CodeBlock />
        <Checklist />
      </div>
    </div>
  );
};

export default Read;
