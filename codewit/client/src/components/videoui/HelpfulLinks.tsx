import { LinkIcon } from "@heroicons/react/24/solid";

const HelpfulLinks = (): JSX.Element => (
  <details className="p-2 font-bold rounded-lg w-full text-white flex flex-col border border-gray-800 overflow-hidden">
    <summary className = "cursor-pointer">Helpful Links</summary>
      <a href="#" className = "inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer">
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        Java Array Documentaiton
      </a>
      <a href = "#" className = "inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer">
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        W3 Schools Java
      </a>
      <a href="#" className = "inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-600 hover:cursor-pointer">
        <LinkIcon fill="#9F2B68" className="w-6 h-6" />
        CodeWorkout Java Array Practice
      </a>
  </details>
);

export default HelpfulLinks;