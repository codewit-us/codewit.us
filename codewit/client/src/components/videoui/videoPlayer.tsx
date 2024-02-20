const VideoPlayer = ({ youtube_id, title }: { youtube_id: string; title: string }): JSX.Element => (
  <div className="bg-zinc-800 w-full h-3/5 aspect-video overflow-hidden text-xl font-bold">
    <iframe
      className="w-full h-full"
      title={title}
      sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-presentation"
      src={`https://youtube.com/embed/${youtube_id}?autoplay=0`}
    ></iframe>
  </div>
);

export default VideoPlayer;