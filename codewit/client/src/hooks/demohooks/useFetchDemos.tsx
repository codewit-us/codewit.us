import { useState, useEffect } from 'react';
import { DemoResponse } from '@codewit/interfaces'; 
import axios from 'axios';

const useFetchDemos = () => {
  const [demos, setDemos] = useState<DemoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const response = await axios.get('/demos');
        setDemos(response.data);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDemos();
  }, []);

  return { demos, loading, error, setDemos };
};

export { useFetchDemos };
