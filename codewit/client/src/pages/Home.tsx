// codewit/client/src/pages/Home.tsx
import { useState } from 'react';
import { useFetchStudentCourses } from '../hooks/useCourse';
import { useAuth } from '../hooks/useAuth';
import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { DemoResponse } from '@codewit/interfaces';
import { PlayIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import bulbLit from '../../public/bulb(lit).svg';
import bulbUnlit from '../../public/bulb(unlit).svg';

const ModuleSection = ({ demo }: { demo: DemoResponse }) => (
  <div className="relative overflow-hidden w-48">
    <div className="relative h-32"> 
      <img 
        src={demo.youtube_thumbnail}
        alt={demo.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-lg items-center justify-center group hover:bg-opacity-30 transition-all">
       <a 
          href={'/read/' + demo.uid}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl text-white opacity-70 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="h-8 w-8 text-white" />
        </a>
      </div>
    </div>

    <div className="p-1">
      <h3 className="font-medium text-sm mb-1 text-white">
        {demo.title}
      </h3>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <h2 className="text-xl font-bold text-white mb-4">No Courses Available</h2>
    <p className="text-zinc-400">Please check back later for available courses.</p>
  </div>
);

const UnauthorizedState = () => (
  <div className="h-2/3 flex flex-col items-center justify-center">
    <h2 className="text-xl font-bold text-white mb-4">Please Sign In</h2>
    <p className="text-zinc-400">Sign in to access your courses</p>
    <form action="http://localhost:3001/oauth2/google" method="get">
      <input
          type="submit"
          value="Log in"
          className="mt-4 px-5 py-2.5 flex items-center text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
      />
    </form>
  </div>
);

const Home = (): JSX.Element => {
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const { data, loading, error } = useFetchStudentCourses();
  const { user } = useAuth();

  // Check for unauthenticated state
  if (!user) {
    return <UnauthorizedState />;
  }

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to fetch courses. Please try again later." />;
  
  // Check for empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <EmptyState />;
  }

  const course = data[0];

  // Additional validation for course structure
  if (!course?.modules) {
    return <Error message="Course data is invalid or incomplete." />;
  }

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="max-w-7xl mx-auto px-10 py-4">

        {course &&
         <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{course?.title}</h1>
            <p className="text-zinc-400">Language: {course?.language}</p>
          </div>
        }

        <div className="space-y-1.5">
          {course?.modules.map((module) => (
           <div key={module.uid} className="bg-foreground-500 overflow-hidden rounded-md font-bold">
              <button
                className="w-full px-10 py-4 flex items-center justify-between hover:bg-foreground-600"
                onClick={() => setExpandedModule(
                  expandedModule === module.uid ? null : module.uid
                )}
              >

                <div className='flex items-center space-x-5'>
                  <img src={bulbLit} className='size-4'/>
                  <span className="text-white text-left">{module.topic}</span>
                  <small className="font-bold text-accent-500">completed</small>
                </div>

                <div>
                  {expandedModule === module.uid ? 
                    <ChevronDownIcon className="h-4 w-4 text-white" /> : 
                    <ChevronRightIcon className="h-4 w-4 text-white" />
                  }
                </div>
              </button>

              {expandedModule === module.uid && (
                <div className="border-t border-zinc-700 px-10 py-2">
                    <p className="font-bold text-white">Choose a Lesson: </p>
                    <div className="flex justify-start space-x-10 py-2">
                      {module.demos.map((demos) => (
                        <ModuleSection key={demos.uid} demo={demos} />
                      ))}
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;