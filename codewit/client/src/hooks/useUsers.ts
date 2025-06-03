// codewit/client/src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '@codewit/interfaces';

// General hook to handle fetching data with axios
const useAxiosFetch = (initialUrl: string, initialData: User[] = []) => {
  const [data, setData] = useState<User[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
     try {
        const { data } = await axios.get(initialUrl);
        setData(data);
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

// Hook to fetch all users
export const useFetchUsers = () => useAxiosFetch('/users');

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

// Hook to set user as admin
export const useSetAdmin = () => {
  const { operation } = useAxiosCRUD('patch');
  return (uid: number, isAdmin: boolean) => operation(`/users/${uid}`, { isAdmin });
};

// Hook to search for a user by email
export const useSearchUser = () => {
  const { operation } = useAxiosCRUD('get');
  return (email: string) => operation(`/users/${email}`);
};
