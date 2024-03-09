import { Link, Outlet } from 'react-router-dom';
import { VideoCameraIcon, DocumentCheckIcon } from '@heroicons/react/24/solid';
const Create = (): JSX.Element => {

  return (
    <div className="md:flex w-full h-container-full">
      <div className="w-full md:w-48 md:h-full bg-background-500 border-solid border-r-1 border-white md:border-gray-800 md:border-r">
        <div className="flex font-medium flex-col p-4">
          <Link to="/create" className="flex gap-2 text-highlight-500 p-2 hover:bg-accent-900 rounded-md">
            <VideoCameraIcon className="w-6 h-6" />
            demo
          </Link>
          <Link to="/create/exercise" className="flex gap-2 text-highlight-500 p-2 hover:bg-accent-900 rounded-md">
            <DocumentCheckIcon className="w-6 h-6" />
            exercise
          </Link>
        </div>
      </div>
      <div className="h-full md:flex-1 bg-zinc-900">
        <Outlet />
      </div>
    </div>
  );
};

export default Create;
