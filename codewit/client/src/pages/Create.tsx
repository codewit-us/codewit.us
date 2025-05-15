// codewit/client/src/pages/Create.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import { VideoCameraIcon, BookOpenIcon, LinkIcon, QueueListIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const Create = (): JSX.Element => {
  const location = useLocation();

  const linkClass = (path: string) => (
    `flex items-center gap-2 p-2 rounded-md text-sm font-medium ${
      location.pathname.includes(path) ? 'bg-foreground-500 text-white' : 'text-gray-300 hover:bg-highlight-800'
    }`
  );

  return (
    <div className="md:flex w-full h-container-full">
      <div className="w-full md:w-52 bg-foreground-800 border-r border-gray-700">
        <div className="flex flex-col p-4 space-y-1">
          <Link to="/create/module" className={linkClass('/create/module')}>
            <QueueListIcon className="w-5 h-5" />
            Module
          </Link>
          <Link to="/create/course" className={linkClass('/create/course')}>
            <VideoCameraIcon className="w-5 h-5" />
            Course
          </Link>
          <Link to="/create/demo" className={linkClass('/create/demo')}>
            <CommandLineIcon className="w-5 h-5" />
            Demo
          </Link>
          <Link to="/create/exercise" className={linkClass('/create/exercise')}>
            <BookOpenIcon className="w-5 h-5" />
            Exercise
          </Link>
          <Link to="/create/resource" className={linkClass('/create/resource')}>
            <LinkIcon className="w-5 h-5" />
            Resource
          </Link>
        </div>
      </div>
      <div className="flex-1 h-full overflow-y-auto bg-foreground-800">
        <Outlet />
      </div>
    </div>
  );
};

export default Create;
