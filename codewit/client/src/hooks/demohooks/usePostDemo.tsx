import { useState } from 'react';
import axios from 'axios';

const usePostDemo = () => {

  const postDemo = async (demoData: any): Promise<any> => {
    try {
      const response = await axios.post('/demos', demoData);
      return response.data; 
    } catch (error) {
      throw Error();
    }
  };

  return { postDemo }; 
};

export default usePostDemo;
