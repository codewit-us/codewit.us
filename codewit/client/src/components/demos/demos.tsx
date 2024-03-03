import { Link } from "react-router-dom";
import LoadingIcons from "../loading/LoadingIcon";
import { TrashIcon, PencilSquareIcon, VideoCameraIcon } from "@heroicons/react/24/solid";

interface VideoProps {
  title: string;
  amountExercises: number;
  uid: number;
  isDeleting?: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
}

const Video = ({ title, uid, amountExercises, isDeleting, handleEdit, handleDelete }: VideoProps): JSX.Element => {
  
  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>, action: string) => {
    e.stopPropagation();
    if (action === 'edit') {
      handleEdit();
    } else if (action === 'delete') {
      handleDelete();
    }
  };
  
  return (
  <div className="flex flex-col h-full bg-gray-800 overflow-hidden rounded-lg transition-transform duration-150 ease-in-out hover:scale-102 cursor-pointer w-full">
      <Link to={`/read/${uid}`} className="flex flex-grow w-full">
        <div className="flex-shrink-0 flex justify-center items-center bg-gray-900 w-full h-full ">
          <VideoCameraIcon fill="#3da2b4" className="w-12 h-12 opacity-50" />
        </div>
      </Link>
      <div className = "flex flex-row justify-center items-center">
        <div className="flex-grow p-3 min-w-0">
              <h2 className="font-semibold text-accent-500 text-sm whitespace-nowrap overflow-hidden truncate">{title}</h2>
              <p className="text-xs text-gray-400 truncate">{amountExercises} Exercises</p>
        </div>
        <button data-testid="edit" onClick={(e) => handleMenuClick(e, 'edit')} className="p-1 text-sm font-medium text-accent-600 rounded-lg hover:text-accent-700 transition-colors duration-200">
          <PencilSquareIcon className="w-4 h-4" />
        </button>
        {
          isDeleting ? (
            <div className="p-1 flex justify-center items-center">
              <LoadingIcons />
            </div>
          ) 
          :
          (
          <button data-testid ="delete" onClick={(e) => handleMenuClick(e, 'delete')} className="p-1 text-sm font-medium text-red-600 rounded-lg hover:text-red-800 transition-colors duration-200">
            <TrashIcon className="w-4 h-4" />
          </button>  
          )      
        }
      </div>
    </div>
  );
};


export default Video;

