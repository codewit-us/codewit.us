const ChecklistItem = ({ checked, text }: { checked: boolean, text: string }):JSX.Element => {
  return (
    <div className={`flex items-center text-xl ${checked ? 'text-green-500' : 'text-red-500'}`}>
      {checked ? '✓' : '✗'} <span className="ml-2">{text}</span>
    </div>
  );
};

export default ChecklistItem;