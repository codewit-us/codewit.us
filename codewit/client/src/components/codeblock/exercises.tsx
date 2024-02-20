import { Exercise } from "client/src/interfaces/demo.interface";

interface ExercisesProps {
  exercises: Exercise[];
}

const Exercises = ({ exercises }: ExercisesProps): JSX.Element => {
  return (
    <div className="w-full">
      {exercises.map((exercise, index) => (
        <div key={exercise.uid} className="mb-6">
          <h3 className="font-semibold text-lg mb-2 bg-blue-100 text-blue-800 p-2 rounded">Exercise {index + 1}</h3>
          <div className="bg-gray-800 text-white font-mono text-sm p-4 rounded overflow-x-auto">
            <code>{exercise.prompt}</code>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Exercises;
