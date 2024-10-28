import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExerciseResponse, Exercise } from '@codewit/interfaces';

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
export const useFetchExercises = () => useAxiosFetch('/exercises');

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
  return (exerciseData: Exercise) => operation('/exercises', exerciseData);
};

// Hook to patch an exercise
export const usePatchExercise = () => {
  const { operation } = useAxiosCRUD('patch');
  return (exerciseData: Exercise, uid: number) => operation(`/exercises/${uid}`, exerciseData);
};

// Hook to delete an exercise
export const useDeleteExercise = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number) => operation(`/exercises/${uid}`);
};
