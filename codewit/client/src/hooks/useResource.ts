// codewit/client/src/hooks/useResource.ts
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Resource } from '@codewit/interfaces';

const resourceBaseUrl = '/api/resources';

// General hook to handle fetching data with axios
const useAxiosFetch = <T>(initialUrl: string, initialData: T) => {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const fetchData = async () => {
      try {
        const response = await axios.get<T>(initialUrl);
        setData(response.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialUrl]);

  return { data, setData, loading, error };
};

// Hook to fetch multiple resources
export const useFetchResources = () => useAxiosFetch<Resource[]>(resourceBaseUrl, []);

// Hook to fetch a single resource
export const useFetchSingleResource = (uid: number) => useAxiosFetch<Resource>(`${resourceBaseUrl}/${uid}`, {} as Resource);

// General hook to handle CRUD operations
const useAxiosCRUD = (method: 'get' | 'post' | 'patch' | 'delete') => {
  const [error, setError] = useState<boolean>(false);
  const [response, setResponse] = useState(null);

  const operation = async (url: string, payload?: any) => {
    try {
      const res = await axios({ method, url, data: payload });
      setResponse(res.data);
      return res.data;
    } catch (err) {
      setError(true);
      throw new Error(`Failed to ${method} data: ${err}`);
    }
  };

  return { operation, response, error };
};

// Hook for posting a new resource
export const usePostResource = () => {
  const { operation } = useAxiosCRUD('post');
  return (resourceData: Resource) => operation(resourceBaseUrl, resourceData);
};

// Hook for patching an existing resource
export const usePatchResource = () => {
  const { operation } = useAxiosCRUD('patch');
  return (resourceData: Resource, uid: number) => operation(`${resourceBaseUrl}/${uid}`, resourceData);
};

// Hook for deleting a resource
export const useDeleteResource = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number) => operation(`${resourceBaseUrl}/${uid}`);
};