// codewit/client/src/hooks/useExercise.ts
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExerciseResponse, Exercise, ExerciseInput } from '@codewit/interfaces';

// Hook to handle fetching data with axios
const useAxiosFetch = (initialUrl: string, initialData: ExerciseResponse[] = []) => {
  const [data, setData] = useState<ExerciseResponse[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(initialUrl);
        setData(response.data);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialUrl]);

  return { data, setData, loading, error };
};

// Hook to fetch all exercises
export const useFetchExercises = () => useAxiosFetch('/api/exercises');

// General hook for handling CRUD operations
const useAxiosCRUD = (method: 'get' | 'post' | 'patch' | 'delete') => {
  const [error, setError] = useState(false);
  const [response, setResponse] = useState(null);

  const operation = async (url: string, payload?: any) => {
    try {
      const res = await axios({ method, url, data: payload });
      setResponse(res.data);
      return res.data;
    } catch (error) {
      setError(true);
      throw new Error(`Failed to ${method} data: ${error}`);
    }
  };

  return { operation, response, error };
};

// Hook to post a new exercise
export const usePostExercise = () => {
  const { operation } = useAxiosCRUD('post');
  return (exerciseData: ExerciseInput) => operation('/api/exercises', exerciseData);
};

// Hook to patch an exercise
export const usePatchExercise = () => {
  const { operation } = useAxiosCRUD('patch');
  return (exerciseData: Exercise, uid: number) => operation(`/api/exercises/${uid}`, exerciseData);
};

// Hook to delete an exercise
export const useDeleteExercise = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number) => operation(`/api/exercises/${uid}`);
};

export const fetchExercisesByIds = async (ids: number[]) => {
  const results = await Promise.all(
    ids.map(id => axios.get<ExerciseResponse>(`/api/exercises/${id}`))
  );
  return results.map(r => r.data);
};

export function single_exercise_query_key(exercise_id: number): ["exercise_id", number] {
  return ["exercise_id", exercise_id];
}

export function use_single_exercise_query(exercise_id: number) {
  return useQuery({
    queryKey: single_exercise_query_key(exercise_id),
    queryFn: async () => {
      try {
        let result = await axios.get<ExerciseResponse>(`/api/exercises/${exercise_id}`);

        return result.data;
      } catch(err) {
        if (axios.isAxiosError(err)) {
          if (err.response.status === 404) {
            // only in the event that the thing we are looking for does not
            // exist do we return null
            return null;
          }
        }

        // everything else is no explicitly handled by this catch
        throw err;
      }
    }
  });
}
