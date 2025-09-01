// codewit/client/src/components/form/CreateButton.tsx
import { PlusIcon } from '@heroicons/react/24/outline';

interface CreateButtonProps {
  title: string;
  onClick: () => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({
  title,
  onClick,
})=> {
  return (
  <div className="flex justify-end">
    <button className="flex bg-accent-500 text-white px-4 py-1 rounded-md" onClick={onClick}>
      <PlusIcon className="w-6 h-6 mr-2"/>
      {title}
    </button>
  </div>
  );
};

export default CreateButton;