// codewit/client/src/hooks/useDemo.ts
import { useState, useEffect } from 'react';
import { DemoResponse, Demo } from '@codewit/interfaces';
import axios from 'axios';

const baseUrl = '/demos';

interface AxiosFetch<T> {
  data: T,
  setData: (value: T | ((prev: T) => T)) => void,
  loading: boolean,
  error: boolean,
}

// General hook to handle fetching data with axios
//
// this will assume that the first mount is the initial loading of the data
// and will indicate that it is loading before sending the actual request to
// the server.
function useAxiosFetch<T>(initialUrl: string, initialData: T): AxiosFetch<T> {
  const [data, setData] = useState(initialData);
  const [active_requests, setActiveRequests] = useState(0);
  const [error, setError] = useState(false);
  const [initial_loading, setInitialLoading] = useState(true);

  const fetchData = async (controller: AbortController) => {
    setActiveRequests(v => (v + 1));

    let canceled = false;

    try {
      const response = await axios.get(initialUrl, {
        signal: controller.signal
      });

      setData(response.data);
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        canceled = true;
      } else {
        setError(true);
      }
    }

    setActiveRequests(v => (v - 1));

    if (!canceled) {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    let controller = new AbortController();

    fetchData(controller);

    return () => {
      controller.abort();
    };
  }, [initialUrl]);

  return { data, setData, loading: initial_loading || active_requests > 0, error };
};

// Hook to fetch multiple demos
export function useFetchDemos() {
  return useAxiosFetch<DemoResponse[]>(baseUrl, []);
};

// Hook to fetch a single demo
export function useFetchSingleDemo(uid: string) {
  return useAxiosFetch<DemoResponse | null>(`${baseUrl}/${uid}`, null);
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
