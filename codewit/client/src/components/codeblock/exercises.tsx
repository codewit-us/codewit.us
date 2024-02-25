import { Exercise } from "client/src/interfaces/demo.interface";

interface ExercisesProps {
  exercises: Exercise[];
}

const Exercises = ({ exercises }: ExercisesProps): JSX.Element => {
  return (
    <div className="w-full">
      {exercises.map((exercise, index) => (
        <div key={exercise.demo_uid} className="mb-6">
          <h3 className="font-semibold text-lg bg-accent-700 text-white p-2 rounded-t">
            Exercise {index + 1}
          </h3>
          <div className="bg-gray-800 text-white font-mono text-sm p-4 rounded-b overflow-x-auto">
            <pre><code>{exercise.prompt}</code></pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Exercises;
