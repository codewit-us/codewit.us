import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

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
export function useAxiosFetch<T>(initialUrl: string, initialData: T): AxiosFetch<T> {
  const [data, setData] = useState(initialData);
  const [active_requests, setActiveRequests] = useState(0);
  const [error, setError] = useState(false);
  const [initial_loading, setInitialLoading] = useState(true);

  const fetchData = async (controller: AbortController) => {
    setActiveRequests(v => (v + 1));

    let canceled = false;

    setError(false);

    try {
      const response = await axios.get(initialUrl, {
        signal: controller.signal
      });

      setData(response.data);
    } catch (err: any) {
      if (err.code === "ERR_CANCELED") {
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
