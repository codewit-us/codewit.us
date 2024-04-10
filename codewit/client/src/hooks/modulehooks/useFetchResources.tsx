import { Resource } from '@codewit/interfaces'; 
import axios from 'axios';

const useFetchResources = () => {

  const fetchResources = async () => {
    try {
      const response = await axios.get('/resources');
      return response.data as Resource[];
    } catch (error) {
      throw Error();
    } 
  };

  return { fetchResources };
};

export default useFetchResources;
