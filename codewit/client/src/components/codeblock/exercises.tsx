import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Exercise {
  demo_uid: number;
  prompt: string;
}

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
          <div className="markdown bg-background-500 text-white font-code p-4 rounded-b overflow-x-auto">
            <Markdown remarkPlugins={[remarkGfm]}>
              {exercise.prompt}
            </Markdown>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Exercises;
