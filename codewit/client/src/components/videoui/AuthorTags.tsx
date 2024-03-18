import { Tag } from "@codewit/interfaces";
import { UserCircleIcon } from "@heroicons/react/24/solid";

interface AuthorTagsProps {
  tags: Tag[] | undefined;
}

const AuthorTags = ({tags}: AuthorTagsProps): JSX.Element => (
  <div className="flex items-center space-x-2 text-white">
    <span className = "inline-flex justify-center items-center gap-1 text-lg font-medium"> 
      by 
      <UserCircleIcon className="w-7 h-7" />
      Jessica
    </span>
    { tags 
      ?
        tags.map((tag: Tag, index: number) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">{tag.name}</span>
        ))
      :
        ''
    }
  </div>
);

export default AuthorTags;