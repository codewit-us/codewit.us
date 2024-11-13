import { VideoCameraIcon } from "@heroicons/react/24/solid";
import React from "react";

// const RelatedDemos = ({ setRelatedDemosOpen }: { setRelatedDemosOpen: (value: boolean) => void }): JSX.Element => (
const RelatedDemos = ({ setRelatedDemosOpen }: { 
  setRelatedDemosOpen: React.Dispatch<React.SetStateAction<boolean>> 
}): JSX.Element => (
  <details className="p-2 font-bold rounded-lg w-full text-white flex flex-col  overflow-hidden">
    <summary className="cursor-pointer" onClick={() => setRelatedDemosOpen(prev => !prev)}>Related Demos</summary>
    <a href="#" className="inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-700 hover:cursor-pointer">
      <div className="bg-background-400 p-3 rounded-sm">
        <VideoCameraIcon className="w-4 h-4" />
      </div>
        Title of Other Video
    </a>
    <a href="#" className = "inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-700 hover:cursor-pointer">
      <div className="bg-background-400 p-3 rounded-sm">
        <VideoCameraIcon className="w-4 h-4" />
      </div>
        Title of Other Video
    </a>
  </details>
);

export default RelatedDemos;