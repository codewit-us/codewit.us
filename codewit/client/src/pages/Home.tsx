import { useState, useEffect } from 'react';
import { useFetchStudentCourses } from '../hooks/useCourse';
import { useAuth } from '../hooks/useAuth';
import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { DemoResponse } from '@codewit/interfaces';
import { Accordion } from '@codewit/shared/components';
import {
  PlayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import bulbLit from '/bulb(lit).svg';
import bulbUnlit from '/bulb(unlit).svg';

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <h2 className="text-xl font-bold text-white mb-4">No Courses Available</h2>
    <p className="text-zinc-400">
      Please check back later for available courses.
    </p>
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
        className="mt-4 px-5 py-2.5 flex items-center text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 focus:ring-4 focus:ring-accent-300"
      />
    </form>
  </div>
);

const Home = ({
  onCourseChange,
}: {
  onCourseChange: (title: string) => void;
}): JSX.Element => {
  const { data, loading, error } = useFetchStudentCourses();
  const { user } = useAuth();

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0 && data[0]?.title) {
      onCourseChange(data[0].title);
    }
  }, [data, onCourseChange]);

  if (loading) return <Loading />;
  if (error)
    return <Error message="Failed to fetch courses. Please try again later." />;
  if (!user) return <UnauthorizedState />;
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState />;

  const course = data[0];
  if (!course?.modules)
    return <Error message="Course data is invalid or incomplete." />;

  const modules = course.modules.map((module) => ({
    moduleHeader: (
      <div className="flex items-center space-x-5">
        <div className="relative">
          <img
            src={bulbLit}
            className="size-6 relative z-10"
            alt="bulb lit"
            style={{
              filter:
                'drop-shadow(0 0 10px rgba(255, 255, 150, 0.9)) drop-shadow(0 0 15px rgba(255, 200, 0, 0.8))',
            }}
          />
          <div className="absolute inset-0 rounded-full bg-yellow-300/40 blur-md -z-10" />
        </div>
        <span className="text-white text-left">{module.topic}</span>
        <small className="font-bold text-accent-500">completed</small>
      </div>
    ),
    moduleContent: (
      <div>
        <p className="font-bold text-white">Choose a lesson: </p>
        <div className="flex justify-center space-x-24 py-2">
          {module.demos.map((demo: DemoResponse, index: number) => (
            <div key={index} className="relative overflow-hidden w-48">
              <div className="relative h-32">
                <img
                  src={demo.youtube_thumbnail}
                  alt={demo.title}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-xl items-center justify-center group hover:bg-opacity-30 transition-all">
                  <a
                    href={'/read/' + demo.uid}
                    rel="noopener noreferrer"
                    className="text-2xl text-white opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    <PlayIcon className="h-6 w-6 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
              <div className="p-1">
                <h3 className="font-medium text-sm mb-1 text-white">
                  {demo.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }));

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="max-w-7xl mx-auto px-10 py-4 space-y-2">
        {/* {course && (
            <p className="text-zinc-400">Language: {course.language}</p>
        )} */}

        <Accordion modules={modules} />
      </div>
    </div>
  );
};

export default Home;
