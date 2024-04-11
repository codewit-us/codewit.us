import axios from 'axios';
import { ExerciseResponse } from '@codewit/interfaces';

// POST an exercise
const usePostExercise = () => {
  const postExercise = async (exercise: any): Promise<any> => {
    try {
      const response = await axios.post('/exercises', exercise);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { postExercise };
};

// PATCH an exercise
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

// GET exercises
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

// DELETE an exercise
const useDeleteExercise = () => {
  const deleteExercise = async (exerciseID: number) => {
    try {
      const response = await axios.delete(`/exercises/${exerciseID}`);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { deleteExercise };
};

export {
  usePostExercise,
  usePatchExercises,
  useFetchExercises,
  useDeleteExercise
};
