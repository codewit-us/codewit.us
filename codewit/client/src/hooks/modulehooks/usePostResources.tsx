import axios from 'axios';

const usePostResource = () => {

  const postResource = async (resourceData: any): Promise<any> => {
    try {
      const response = await axios.post('/resources', resourceData);
      return response.data; 
    } catch (error) {
      throw Error();
    }
  };

  return { postResource }; 
};

export default usePostResource;
