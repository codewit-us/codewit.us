import axios from 'axios';
import { Module } from '@codewit/interfaces';

// POST a module
const usePostModule = () => {
  const postModule = async (moduleData: Module): Promise<any> => {
    try {
      const response = await axios.post('/modules', moduleData);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { postModule };
};

// PATCH a module
const usePatchModule = () => {
  const patchModule = async (moduleData: Module, uid: number) => {
    try {
      const response = await axios.patch(`/modules/${uid}`, moduleData);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { patchModule };
};

// GET modules
const useFetchModules = () => {
  const fetchModules = async () => {
    try {
      const response = await axios.get('/modules');
      return response.data as Module[];
    } catch (error) {
      throw Error();
    }
  };

  return { fetchModules };
};

// DELETE a module
const useDeleteModule = () => {
  const deleteModule = async (moduleID: number) => {
    try {
      const response = await axios.delete(`/modules/${moduleID}`);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { deleteModule };
};

export { 
  usePostModule, 
  usePatchModule, 
  useFetchModules, 
  useDeleteModule 
};