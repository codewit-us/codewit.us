import { useState } from 'react';
import axios from 'axios';

const usePatchDemo = () => {

  const patchDemo = async (demoData: any, uid: number): Promise<any> => {
    try {
      const response = await axios.patch(`/demos/${uid}`, demoData);
      return response.data; 
    } catch (error) {
      throw Error();
    }
  };

  return { patchDemo }; 
};

export default usePatchDemo;
