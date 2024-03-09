import { UserCircleIcon } from "@heroicons/react/24/solid";

const AuthorTags = (): JSX.Element => (
  <div className="flex items-center space-x-2 text-white">
    <span className = "inline-flex justify-center items-center gap-1 text-lg font-medium"> 
      by 
      <UserCircleIcon className="w-7 h-7" />
      Jessica
    </span>
    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">#tag</span>
    <span className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">#tag</span>
    <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">#tag</span>
    <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">#tag</span>
  </div>
);

export default AuthorTags;