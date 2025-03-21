// codewit/client/src/components/videoui/VideoHeader.tsx
import { HandThumbUpIcon } from "@heroicons/react/24/outline";

const VideoHeader = ({ title, uid, handleClick }: { title: string, uid:number | undefined, handleClick: (uid: number) => void; }): JSX.Element => (
  <div className="flex justify-between items-center mt-4">
    <h2 data-testid="demo-title" className="text-3xl font-bold text-white">{title}</h2>
    <button
      onClick={() => handleClick(uid ?? 0)}
      type="button"
      data-testid="like-button"
      className="group px-2 py-1 text-md font-medium text-center flex items-center text-white  rounded-lg  border-2 border-accent-400 hover:bg-accent-400 focus:outline-none"     
    >      
      <HandThumbUpIcon className="w-6 h-6 mr-2 text-accent-400 group-hover:text-white" />
      <span  className="text-accent-400 group-hover:text-white">Like</span>
    </button>
  </div>
);

export default VideoHeader;