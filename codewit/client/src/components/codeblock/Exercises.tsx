import React from 'react';
import MDEditor from '@uiw/react-markdown-editor';
import { Exercise } from '@codewit/interfaces';
import { useEffect } from 'react';

interface ExercisesProps {
  exercises: Exercise[];
  idx: number;
}

const Exercises = ({ exercises, idx }: ExercisesProps): JSX.Element => {

  return (
    <div className="w-full">
      <div key={idx}>
        <h3 className="font-semibold text-lg bg-accent-700 text-white py-2 px-3 rounded-t">
          Exercise {idx + 1}
        </h3>
        {/* <MDEditor.Markdown source={exercises[idx]?.prompt} className="bg-accent-700 p-2"/> */}
      </div>
    </div>
  );
};

export default Exercises;