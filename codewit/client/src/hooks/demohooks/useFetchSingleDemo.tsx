import { useState, useEffect } from 'react';
import axios from 'axios';
import { DemoResponse } from '@codewit/interfaces'; 

interface UseFetchSingleDemoReturn {
  demo: DemoResponse | null;
  loading: boolean;
  error: boolean;
}

const useFetchSingleDemo = (uid: string): UseFetchSingleDemoReturn => {
  const [demo, setDemo] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const response = await axios.get(`/demos/${uid}`);
        setDemo(response.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchDemo();
    }
  }, [uid]);

  return { demo, loading, error };
};

export default useFetchSingleDemo;
