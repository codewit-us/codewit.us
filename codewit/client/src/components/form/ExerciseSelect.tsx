import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { SelectStyles } from '../../utils/styles.js';
import { MultiValue } from 'react-select';
import { ExerciseResponse } from '@codewit/interfaces';

interface ExerciseSelectProps {
  onSelectExercises: (exercises: string[]) => void;
  initialExercises: string[];
}

interface Option {
  label: string;
  value: string;
}

const ExerciseSelect = ({ onSelectExercises, initialExercises }: ExerciseSelectProps): JSX.Element => {
  const [exercises, setExercises] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialExercises && initialExercises.length > 0) {
      const initialSelection = exercises.filter(exercise => initialExercises.includes(exercise.value));
      setSelectedOptions(initialSelection);
    }
  }, [initialExercises, exercises]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get('/exercises');
        const exerciseOptions = response.data.map((exercise: ExerciseResponse) => ({
          value: exercise.uid,
          label: exercise.prompt
        }));
        setExercises(exerciseOptions);
      } catch (error) {
        setError(true);
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  const handleChange = (newValue: MultiValue<Option>) => {
    const selectedOptions = Array.from(newValue);
    setSelectedOptions(selectedOptions);
    onSelectExercises(selectedOptions.map(option => option.value));
  };
  

  if (error) {
    return <span className="text-red-500">ERROR! Unable To Load Exercise Form</span>;
  }

  return (
    <div className="flex flex-col justify-center items-start w-full">
      <label htmlFor="exercise-select" className="block mb-2 text-sm font-medium text-gray-400">Select Exercises</label>
      <Select
        id="exercise-select"
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        options={exercises}
        className="text-sm bg-blue text-white border-none w-full rounded-lg"
        styles={SelectStyles}
      />
    </div>
  );
};

export default ExerciseSelect;
