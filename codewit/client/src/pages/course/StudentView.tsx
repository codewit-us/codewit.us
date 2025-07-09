import { useState } from "react";
import { Link } from "react-router-dom";
import { PlayIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

import { StudentCourse, StudentModule, StudentDemo } from "@codewit/interfaces";
import { cn } from "../../utils/styles";

import bulbLit from "/bulb(lit).svg";
import bulbUnlit from "/bulb(unlit).svg";

export interface StudentViewProps {
  course: StudentCourse
}

export default function StudentView({course}: StudentViewProps) {
  const [open_index, set_open_index] = useState<number | null>(() => {
    if (course.modules.length > 0) {
      for (let module of course.modules) {
        if (module.demos.length === 0 || module.completion === 1) {
          continue;
        }

        return module.uid;
      }
    }

    return null;
  });

  if (course.modules.length === 0) {
    return <div className="h-container-full max-w-full flex items-center justify-center bg-zinc-900">
      <div className="w-1/2 flex flex-col flex-nowrap items-center bg-foreground-500 rounded-2xl p-4">
        <h2 className="text-2xl text-white">No Modules for Course</h2>
        <p className="text-center text-white">
          There are no modules available for this course. Come back once modules have been added.
        </p>
        <Link to="/" className="text-white bg-accent-500 rounded-md mt-4 p-2">
          Back to Home page.
        </Link>
      </div>
    </div>;
  }

  let modules = [];
  let index = 0;

  for (; index < course.modules.length; index += 1) {
    let module = course.modules[index];

    modules.push(<div key={module.uid} className="collapse bg-foreground-500 collapse-arrow">
      <input
        type="radio"
        name="demo"
        checked={module.uid === open_index}
        onChange={() => set_open_index(open_index === module.uid ? null : module.uid)}
      />
      <div
        className="collapse-title text-xl font-medium"
        onClick={() => {
          set_open_index(open_index === module.uid ? null : module.uid);
        }}
      >
        <CourseModuleHeader allow_selection={true} module={module}/>
      </div>
      <div className="collapse-content">
        <CourseModuleContent course_id={course.id} module={module}/>
      </div>
    </div>);

    if (module.demos.length > 0 && module.completion !== 1) {
      break;
    }
  }

  // increment by 1 to avoid repeating the previous module
  for (index += 1; index < course.modules.length; index += 1) {
    let module = course.modules[index];

    modules.push(<div key={module.uid} className="bg-foreground-700 rounded-2xl">
      <div className="collapse-title text-xl font-medium">
        <CourseModuleHeader allow_selection={false} module={module}/>
      </div>
    </div>);
  }

  return <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
    <div className="max-w-7xl mx-auto px-10 py-4 space-y-2">
      {modules}
    </div>
  </div>;
}

interface CourseModuleHeaderProps {
  allow_selection: boolean,
  module: StudentModule,
}

function CourseModuleHeader({allow_selection, module}: CourseModuleHeaderProps) {
  let header_status = null;

  if (allow_selection) {
    header_status = module.demos.length === 0 || module.completion === 1 ?
      "Completed" :
      `${(module.completion * 100).toFixed(0)}% Complete`;
  }

  return <div className={cn("flex items-center space-x-5", {"cursor-default": !allow_selection})}>
    <div className="relative">
      {module.completion === 1 ?
        <img
          src={bulbLit}
          className="size-6 relative"
          alt="bulb lit"
          style={{
            filter:
              "drop-shadow(0 0 10px rgba(255, 255, 150, 0.9)) drop-shadow(0 0 15px rgba(255, 200, 0, 0.8))",
          }}
        />
        :
        <img src={bulbUnlit} className="size-6 relative" alt="bulb unlit"/>
      }
      <div className="absolute inset-0 rounded-full bg-yellow-300/40 blur-md -z-10"/>
    </div>
    <span className="text-white text-left">{module.topic}</span>
    <small className="font-bold text-accent-500">{header_status}</small>
  </div>
}

interface CourseModuleContentProps {
  course_id: string,
  module: StudentModule
}

function CourseModuleContent({course_id, module}: CourseModuleContentProps) {
  if (module.demos.length === 0) {
    return <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl text-white">No Lessons for Module</h2>
      <p className="text-center text-white">
        There are no lessons for this module.
      </p>
    </div>;
  }

  let demos = module.demos.map(demo => <CourseModuleDemo key={demo.uid} course_id={course_id} demo={demo}/>);

  return <>
    <p className="font-bold text-white">Choose a lesson: </p>
    <div className="flex justify-center space-x-24 py-2">
      {demos}
    </div>
  </>
}

interface CourseModuleDemoProps {
  course_id: string,
  demo: StudentDemo
}

function CourseModuleDemo({course_id, demo}: CourseModuleDemoProps) {
  let status = null;

  if (demo.completion !== 0 && demo.completion !== 1) {
    status = `${(demo.completion * 100).toFixed(0)}%`;
  }

  return <div className="relative overflow-hidden w-48">
    <div className="relative h-32">
      <img
        src={demo.youtube_thumbnail}
        alt={demo.title}
        className="w-full h-full object-cover rounded-xl"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-xl items-center justify-center group hover:bg-opacity-30">
        <Link
          to={`/read/${demo.uid}?course_id=${course_id}`}
          className="text-2xl opacity-70 group-hover:opacity-100"
        >
          {demo.completion === 1 ?
            <CheckCircleIcon className="h-8 w-8 text-green-500 opacity-40 group-hover:opacity-100"/>
            :
            <div className="flex flex-row items-center gap-2 ">
              {status}
              <PlayIcon className="h-8 w-8 text-white opacity-40 group-hover:opacity-100"/>
            </div>
          }
        </Link>
      </div>
    </div>
    <div className="p-1">
      <h3 className="font-medium text-sm mb-1 text-white">
        {demo.title}
      </h3>
    </div>
  </div>;
}
