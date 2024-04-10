import { ExerciseResponse } from '@codewit/interfaces'; 
import axios from 'axios';

const usePatchExercises = () => {

  const patchExercises = async (exerciseData: any, uid: number) => {
    try {
      const response = await axios.patch(`/exercises/${uid}`, exerciseData);
      return response.data;
    } catch (error) {
      throw Error();
    } 
  };

  return { patchExercises };
};

export default usePatchExercises;
