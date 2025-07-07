import { useEffect, useState } from 'react';
import { Exercise } from '@codewit/interfaces';
import axios from 'axios';

export default function useExercisesByIds(ids: number[]) {
  const [data, setData]   = useState<Exercise[]>([]);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]   = useState<boolean>(false);

  useEffect(() => {
    if (!ids.length) return;
    setLoading(true);
    axios
      .get<Exercise[]>('/exercises', { params: { ids } })
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ids.join(',')]);

  return { data, loading, error };
}