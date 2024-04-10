import axios from 'axios';

const useDeleteDemoExercise = () => {

  const deleteDemoExercise = async (exercises: any, uid: number): Promise<any> => {
    try {
      console.log(exercises)
      
      const response = await axios.delete(`/demos/${uid}/exercises`, {data: exercises});
      return response.data; 
    } catch (error) {
      throw Error();
    }
  };

  return { deleteDemoExercise }; 
};

export default useDeleteDemoExercise;

 
