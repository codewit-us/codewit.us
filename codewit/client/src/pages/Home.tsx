// codewit/client/src/pages/Home.tsx
import { useFetchStudentCourses } from '../hooks/useCourse';
import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { useState } from 'react';
import { Resource } from '@codewit/interfaces';
import { PlayIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import bulbLit from '../../public/bulb(lit).svg';
import buldUnlit from '../../public/bulb(lit).svg';

const ModuleSection = ({ resource }: { resource: Resource }) => (
  <div className="relative overflow-hidden w-48">
    <div className="relative h-32"> 
      <img 
        src={resource.url}
        alt={resource.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-lg items-center justify-center group hover:bg-opacity-30 transition-all">
       <a 
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl text-white opacity-70 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="h-8 w-8 text-white" />
        </a>
      </div>
    </div>

    <div className="p-1">
      <h3 className="font-medium text-sm mb-1 text-white">
        {resource.title}
      </h3>
    </div>
  </div>
);

const Home = (): JSX.Element => {
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const { data, loading, error } = useFetchStudentCourses();
  const course = data[0];

  // console.log(course)

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to fetch courses. Please try again later." />;

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="max-w-7xl mx-auto px-10 py-4">
       
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-zinc-400">Language: {course.language}</p>
        </div>

        <div className="space-y-1.5">
          {course.modules.map((module) => (
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
                      {module.resources.map((resource) => (
                        <ModuleSection key={resource.uid} resource={resource} />
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