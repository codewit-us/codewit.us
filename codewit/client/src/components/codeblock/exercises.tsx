import React from 'react';
import MDEditor from '@uiw/react-markdown-editor';
import { Exercise } from '@codewit/interfaces';

interface ExercisesProps {
  exercises: Exercise[];
}

const Exercises = ({ exercises }: ExercisesProps): JSX.Element => {
  return (
    <div className="w-full">
      {exercises.map((exercise, index) => (
        <div key={index} className="mb-2">
          <h3 className="font-semibold text-lg bg-accent-700 text-white p-2 rounded-t">
            Exercise {index + 1}
          </h3>
          <MDEditor.Markdown source={exercise.prompt} className="bg-none p-2"/>
        </div>
      ))}
    </div>
  );
};

export default Exercises;
