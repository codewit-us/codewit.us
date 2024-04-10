import axios from 'axios';

const usePatchResource = () => {

  const patchResource = async (resourceData: any, uid: number) => {
    try {
      const response = await axios.patch(`/resources/${uid}`, resourceData);
      return response.data;
    } catch (error) {
      throw Error();
    } 
  };

  return { patchResource };
};

export default usePatchResource;
