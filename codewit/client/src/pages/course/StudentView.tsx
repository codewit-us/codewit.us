import { Link } from "react-router-dom";
import {
  PlayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

import { StudentCourse } from "@codewit/interfaces";
import { Accordion } from '@codewit/shared/components';

import bulbLit from '/bulb(lit).svg';
import bulbUnlit from '/bulb(unlit).svg';

export interface StudentViewProps {
  course: StudentCourse
}

export default function StudentView({course}: StudentViewProps) {
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
          {module.demos.map((demo, index) => (
            <div key={index} className="relative overflow-hidden w-48">
              <div className="relative h-32">
                <img
                  src={demo.youtube_thumbnail}
                  alt={demo.title}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-xl items-center justify-center group hover:bg-opacity-30 transition-all">
                  <Link
                    to={`/read/${demo.uid}`}
                    className="text-2xl text-white opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    <PlayIcon className="h-6 w-6 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
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
        <Accordion modules={modules} />
      </div>
    </div>
  );
}
