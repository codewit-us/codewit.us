import axios from 'axios';

const useDeleteResource = () => {

  const deleteResource = async (resourceID: number | undefined) => {
    try {
      const response = await axios.delete(`/resources/${resourceID}`);
      return response.data;
    } catch (error) {
      throw Error();
    } 
  };

  return { deleteResource };
};

export default useDeleteResource;
