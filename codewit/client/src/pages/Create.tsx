import { Link, Outlet } from 'react-router-dom';
import { VideoCameraIcon, BookOpenIcon} from '@heroicons/react/24/outline'

const Create = (): JSX.Element => {

  return (
    <div className="md:flex w-full h-container-full">
      <div className="w-full md:w-40 md:h-full bg-background-500 border-solid border-r-1 border-white md:border-gray-800 md:border-r">
        <div className="flex font-medium text- flex-col p-4">
          <Link to="/create" className="flex items-center gap-2 text-gray-300 p-2 hover:bg-accent-900 rounded-md">
            <VideoCameraIcon className="w-5 h-5" />
            Demo
          </Link>
          <Link to="/create/exercise" className="flex items-center gap-2 text-gray-300 p-2 hover:bg-accent-900 rounded-md">
            <BookOpenIcon className="w-5 h-5" />
            Exercise
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
