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

function module_demos_complete(module: StudentModule) {
  if (module.demos.length === 0) {
    return 1;
  }

  let count = 0;

  for (let demo of module.demos) {
    count += demo.completion === 1 ? 1 : 0;
  }

  return count / module.demos.length;
}

export default function StudentView({course}: StudentViewProps) {
  const [open_index, set_open_index] = useState<number | null>(() => {
    if (course.modules.length > 0) {
      for (let module of course.modules) {
        if (module_demos_complete(module) === 1) {
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

  const modules = course.modules.map((module, index, all) => {
    let allow_selection = index !== 0 ? module_demos_complete(all[index - 1]) === 1 : true;

    return <div
      key={module.uid}
      className={cn({
        "collapse bg-foreground-500 collapse-arrow": allow_selection,
        "bg-foreground-700 rounded-2xl": !allow_selection}
      )}
    >
      {allow_selection ?
        <>
          <input
            type="radio"
            name="demo"
            disabled={!allow_selection}
            checked={module.uid === open_index}
            onChange={() => set_open_index(open_index === module.uid ? null : module.uid)}
          />
          <div
            className="collapse-title text-xl font-medium"
            onClick={() => {
              set_open_index(open_index === module.uid ? null : module.uid);
            }}
          >
            <CourseModuleHeader allow_selection={allow_selection} module={module}/>
          </div>
          <div className="collapse-content">
            <CourseModuleContent module={module}/>
          </div>
        </>
        :
        <div className="collapse-title text-xl font-medium">
          <CourseModuleHeader allow_selection={allow_selection} module={module}/>
        </div>
      }
    </div>
  });

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
    let completion_percent = module_demos_complete(module);

    if (completion_percent === 1.0) {
      header_status = "Completed";
    } else {
      header_status = `${(completion_percent * 100).toFixed(0)}% Complete`;
    }
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
  module: StudentModule
}

function CourseModuleContent({module}: CourseModuleContentProps) {
  if (module.demos.length === 0) {
    return <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl text-white">No Lessons for Module</h2>
      <p className="text-center text-white">
        There are no lessons for this module.
      </p>
    </div>;
  }

  let demos = module.demos.map((demo, index) => (
    <CourseModuleDemo key={demo.uid} demo={demo}/>
  ));

  return <>
    <p className="font-bold text-white">Choose a lesson: </p>
    <div className="flex justify-center space-x-24 py-2">
      {demos}
    </div>
  </>
}

interface CourseModuleDemoProps {
  demo: StudentDemo
}

function CourseModuleDemo({demo}: CourseModuleDemoProps) {
  return <div className="relative overflow-hidden w-48">
    <div className="relative h-32">
      <img
        src={demo.youtube_thumbnail}
        alt={demo.title}
        className="w-full h-full object-cover rounded-xl"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-xl items-center justify-center group hover:bg-opacity-30">
        <Link
          to={`/read/${demo.uid}`}
          className="text-2xl opacity-70 group-hover:opacity-100"
        >
          {demo.completion === 1 ?
            <CheckCircleIcon className="h-8 w-8 text-green-500 opacity-40 group-hover:opacity-100"/>
            :
            <PlayIcon className="h-8 w-8 text-white opacity-40 group-hover:opacity-100"/>
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
