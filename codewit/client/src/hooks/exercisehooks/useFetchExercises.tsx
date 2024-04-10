import { ExerciseResponse } from '@codewit/interfaces'; 
import axios from 'axios';

const useFetchExercises = () => {

  const fetchExercises = async () => {
    try {
      const response = await axios.get('/exercises');
      return response.data as ExerciseResponse[];
    } catch (error) {
      throw Error();
    } 
  };

  return { fetchExercises };
};

export default useFetchExercises;
