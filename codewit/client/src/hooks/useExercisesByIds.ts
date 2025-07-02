import { useEffect, useState } from 'react';
import { Exercise } from '@codewit/interfaces';
import axios from 'axios';

export default function useExercisesByIds(ids: number[]) {
  const [data, setData]   = useState<Exercise[]>([]);
  const [loading, setL]   = useState<boolean>(true);
  const [error, setErr]   = useState<boolean>(false);

  useEffect(() => {
    if (!ids.length) return;
    setL(true);
    axios
      .get<Exercise[]>('/exercises', { params: { ids } })
      .then(r => setData(r.data))
      .catch(() => setErr(true))
      .finally(() => setL(false));
  }, [ids.join(',')]);

  return { data, loading, error };
}