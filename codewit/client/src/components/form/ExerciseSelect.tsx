// codewit/client/src/components/form/ExerciseSelect.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Select, { MultiValue } from 'react-select';
import { SelectStyles } from '../../utils/styles.js';
import { ExerciseResponse } from '@codewit/interfaces';
import { useExercisesQuery } from '../../hooks/useExercises';

interface ExerciseSelectProps {
  onSelectExercises: (exercises: string[]) => void;
  initialExercises: number[];
}

type Option = { label: string; value: string };

const ExerciseSelect = ({ onSelectExercises, initialExercises }: ExerciseSelectProps): JSX.Element => {
  const { data: exercises = [], isLoading, isFetching, error } = useExercisesQuery();

  const options: Option[] = useMemo(
    () =>
      exercises.map((ex: ExerciseResponse) => ({
        value: String(ex.uid),
        label: ex.prompt,
      })),
    [exercises]
  );

  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (!options.length) return;
    if (!initialExercises?.length) {
      setSelectedOptions([]);
      return;
    }
    const next = options.filter(opt => initialExercises.includes(Number(opt.value)));
    setSelectedOptions(next);
  }, [initialExercises, options]);

  const handleChange = (newValue: MultiValue<Option>) => {
    const next = Array.from(newValue);
    setSelectedOptions(next);
    onSelectExercises(next.map(o => o.value));
  };

  if (error) {
    return <span className="text-red-500">ERROR! Unable To Load Exercise Form</span>;
  }

  return (
    <div className="flex flex-col justify-center items-start w-full">
      <label htmlFor="exercise-select" className="block mb-2 text-sm font-medium text-gray-400">
        Select Exercises
      </label>

      <Select
        id="exercise-select"
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        options={options}
        className="text-sm bg-blue text-white border-none w-full rounded-lg"
        styles={SelectStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        menuPlacement="auto"
        isLoading={isLoading || isFetching}
      />
    </div>
  );
};

export default ExerciseSelect;