import axios from 'axios';

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

export default useDeleteExercise;
