// codewit/client/src/hooks/useModule.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Module, ModuleDraft } from '@codewit/interfaces';

// General hook to handle fetching data with axios
const useAxiosFetch = (initialUrl: string, initialData: Module[] = []) => {
  const [data, setData] = useState<Module[]>(initialData);
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

// Hook to fetch all modules
export const useFetchModules = () => useAxiosFetch('/api/modules');

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

// Hook to post a new module
export const usePostModule = () => {
  const { operation } = useAxiosCRUD('post');
  return (moduleData: ModuleDraft) => operation('/api/modules', moduleData);
};

// Hook to patch an existing module
export const usePatchModule = () => {
  const { operation } = useAxiosCRUD('patch');
  return (moduleData: ModuleDraft, uid: number) => operation(`/api/modules/${uid}`, moduleData);
};

// Hook to delete a module
export const useDeleteModule = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number) => operation(`/api/modules/${uid}`);
};
