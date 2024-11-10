interface CreateButtonProps {
  title: string;
  onClick: () => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({
  title,
  onClick,
})=> {
  return (
  <div className="flex justify-end mb-2">
    <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={onClick}>
      {title}
    </button>
  </div>
  );
};

export default CreateButton;