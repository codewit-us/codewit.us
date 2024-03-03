import { HandThumbUpIcon } from "@heroicons/react/24/solid";

const VideoHeader = ({ title, uid, handleClick }: { title: string, uid:number | undefined, handleClick: (uid: number) => void; }): JSX.Element => (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <button
      onClick={() => handleClick(uid ?? 0)}
      type="button"
      className="px-2 py-1 text-md font-medium text-center flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"     
    >      
      <span className="mr-2">Like</span>
      <HandThumbUpIcon className="w-4 h-4" />
    </button>
  </div>
);

export default VideoHeader;