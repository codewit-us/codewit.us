import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { ExerciseResponse } from '@codewit/interfaces';

export const EXERCISES_KEY = ['exercises'] as const;

export function fetchExercises() {
  return axios.get<ExerciseResponse[]>('/exercises', { withCredentials: true })
              .then(r => r.data);
}

export function useExercisesQuery() {
  return useQuery({
    queryKey: EXERCISES_KEY,
    queryFn : fetchExercises,
    staleTime: 30_000,
  });
}