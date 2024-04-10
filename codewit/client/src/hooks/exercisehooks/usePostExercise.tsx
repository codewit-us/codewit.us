import axios from 'axios';

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

export default usePostExercise;
