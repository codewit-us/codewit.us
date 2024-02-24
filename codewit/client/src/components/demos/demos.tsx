import { Link } from "react-router-dom";
import LoadingIcons from "../loading/loadingIcon";

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
    <div className="flex flex-col h-full bg-gray-800 overflow-hidden rounded-lg cursor-pointer w-full">
      <Link to ={`/read/${uid}`} className="flex flex-grow w-full">
        <div className="flex-shrink-0 flex justify-center items-center bg-gray-900 w-full h-full ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3da2b4" className="opacity-50 w-12 h-12">
          <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
        </svg>
        </div>
      </Link>
      <div className = "flex flex-row justify-center items-center">
        <div className="flex-grow p-3 min-w-0">
              <h2 className="font-semibold text-accent-500 text-sm whitespace-nowrap overflow-hidden truncate">{title}</h2>
              <p className="text-xs text-gray-400 truncate">{amountExercises} Exercises</p>
        </div>
        <button onClick={(e) => handleMenuClick(e, 'edit')} className="p-1 text-sm font-medium text-accent-600 rounded-lg hover:text-accent-700 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
          </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
            </svg>
          </button>  
          )      
        }
      </div>
    </div>
  );
};


export default Video;

