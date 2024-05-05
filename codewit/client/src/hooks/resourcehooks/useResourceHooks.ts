import axios from 'axios';
import { Resource } from '@codewit/interfaces';

// POST a resource
const usePostResource = () => {
  const postResource = async (resourceData: Resource): Promise<any> => {
    try {
      const response = await axios.post('/resources', resourceData);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { postResource };
};

// PATCH a resource
const usePatchResource = () => {
  const patchResource = async (resourceData: Resource, uid: number) => {
    try {
      const response = await axios.patch(`/resources/${uid}`, resourceData);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { patchResource };
};

// GET resources
const useFetchResources = () => {
  const fetchResources = async () => {
    try {
      const response = await axios.get('/resources');
      return response.data as Resource[];
    } catch (error) {
      throw Error();
    }
  };

  return { fetchResources };
};

// DELETE a resource
const useDeleteResource = () => {
  const deleteResource = async (resourceID: number) => {
    try {
      const response = await axios.delete(`/resources/${resourceID}`);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { deleteResource };
};

export {
  usePostResource,
  usePatchResource,
  useFetchResources,
  useDeleteResource
};
