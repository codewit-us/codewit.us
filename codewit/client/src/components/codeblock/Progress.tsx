// codewit/client/src/components/codeblock/Progress.tsx
const Progress = ({ percentage }: { percentage: number }): JSX.Element => {
  return (
    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
      <div 
      className="bg-green-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
      style={{ width: `${percentage}%` }}> 
        {percentage}%
      </div>
    </div>
  );
  

};



export default Progress;