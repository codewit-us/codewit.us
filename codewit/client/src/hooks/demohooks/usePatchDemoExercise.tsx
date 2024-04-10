import axios from 'axios';

const usePatchDemoExercise = () => {

  const patchDemoExercise = async (exercises: any, uid: number): Promise<any> => {
    try {
      const response = await axios.patch(`/demos/${uid}/exercises`, exercises);
      return response.data; 
    } catch (error) {
      throw Error();
    }
  };

  return { patchDemoExercise }; 
};

export { usePatchDemoExercise };
