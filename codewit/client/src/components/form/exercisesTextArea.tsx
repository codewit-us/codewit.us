import React from 'react';
import { Exercise } from 'client/src/interfaces/demo.interface';

interface ExerciseListProps {
  exercises: Exercise[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

const ExerciseList = ({ exercises, onAdd, onRemove, onChange }: ExerciseListProps): JSX.Element => {
  return (
    <div>
      {exercises.map((exercise, index) => (
        <div key={index} className="mb-5">
          <div className="relative">
            <textarea
              id={`exercise-prompt-${index}`}
              data-testid={`exercise-${index}`}
              className="shadow-sm bg-gray-600 border border-gray-600 text-white text-sm rounded-md block w-full p-2.5"
              placeholder={`Exercise ${index} prompt`}
              value={exercise.prompt}
              onChange={(e) => onChange(index, e.target.value)}
            />
            <button
              type="button"
              data-testid="remove-exercise"
              onClick={() => onRemove(index)}
              className="absolute top-0 right-0 mr-2 text-red-600 hover:text-red-800"
            >
              x
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-white bg-accent-500 hover:bg-accent-600 font-medium rounded-md text-sm px-3 py-2 text-center"
      >
        add exercise
      </button>
    </div>
  );
};

export default ExerciseList;
