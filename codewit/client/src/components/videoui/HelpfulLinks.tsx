// codewit/client/src/components/videoui/HelpfulLinks.tsx
import { LinkIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const HelpfulLinks = (): JSX.Element => (
  <details className="font-bold rounded-lg w-full text-white flex flex-col flow-hidden group">
    <summary className="px-2 py-1 cursor-pointer list-none flex items-center gap-2 hover:bg-accent-500/20 transition-all rounded-lg">
      <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-90" />
      Helpful Links
    </summary>
    <div className="flex flex-col ml-6">
      <a
        href="#"
        className="inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer"
      >
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        Java Array Documentaiton
      </a>
      <a
        href="#"
        className="inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer"
      >
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        W3 Schools Java
      </a>
      <a
        href="#"
        className="inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer"
      >
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        CodeWorkout Java Array Practice
      </a>
      <a
        href="#"
        className="inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer"
      >
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        CodeWorkout Java Array Practice
      </a>
    </div>
  </details>
);

export default HelpfulLinks;