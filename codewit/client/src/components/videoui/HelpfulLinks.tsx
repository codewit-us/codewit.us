// codewit/client/src/components/videoui/HelpfulLinks.tsx
import { LinkIcon } from "@heroicons/react/24/solid";

const HelpfulLinks = (): JSX.Element => (
  <details className="p-2 font-bold rounded-lg w-full text-white flex flex-col flow-hidden">
    <summary className = "cursor-pointer">Helpful Links</summary>
    <div className = "flex flex-col">
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
    </div>
  </details>
);

export default HelpfulLinks;