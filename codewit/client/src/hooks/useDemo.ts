// codewit/client/src/hooks/useDemo.ts
import { useState, useEffect } from 'react';
import { DemoResponse, Demo } from '@codewit/interfaces';
import axios from 'axios';

const baseUrl = '/demos';

// General hook to handle fetching data with axios
const useAxiosFetch = (initialUrl: string, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
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

// Hook to fetch multiple demos
export const useFetchDemos = () => {
  return useAxiosFetch(baseUrl, []);
};

// Hook to fetch a single demo
export const useFetchSingleDemo = (uid: string) => {
  return useAxiosFetch(`${baseUrl}/${uid}`);
};

// General hook to handle CRUD operations
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

// Hook for patching a demo
export const usePatchDemo = () => {
  const { operation } = useAxiosCRUD('patch');
  return (demoData: DemoResponse, uid: number) => operation(`${baseUrl}/${uid}`, demoData);
};

// Hook for posting a new demo
export const usePostDemo = () => {
  const { operation } = useAxiosCRUD('post');
  return (demoData: DemoResponse) => operation(baseUrl, demoData);
};

// Hook for deleting a demo
export const useDeleteDemo = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number) => operation(`${baseUrl}/${uid}`);
};

// Hook for patching a demo exercise
export const usePatchDemoExercise = () => {
  const { operation } = useAxiosCRUD('patch');
  return (exercises: any, uid: number) => operation(`${baseUrl}/${uid}/exercises`, exercises);
};

// Hook for deleting a demo exercise
export const useDeleteDemoExercise = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number, exercises: any) => operation(`${baseUrl}/${uid}/exercises`, { data: exercises });
};
