import { useState } from 'react';
import axios from 'axios';

interface UseDeleteDemosReturn {
  deleteDemo: (demoUid: number) => Promise<void>;
  isDeleting: { [key: string]: boolean };
  error: boolean;
}

const useDeleteDemo = (onSuccess: (demoUid: number) => void): UseDeleteDemosReturn => {
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<boolean>(false);

  const deleteDemo = async (demoUid: number) => {
    setIsDeleting(prev => ({ ...prev, [demoUid]: true }));
    try {
      await axios.delete(`/demos/${demoUid}`);
      onSuccess(demoUid);
    } catch (err) {
      setError(true);
    } finally {
      setIsDeleting(prev => ({ ...prev, [demoUid]: false }));
    }
  };

  return { deleteDemo, isDeleting, error };
};

export default useDeleteDemo;
