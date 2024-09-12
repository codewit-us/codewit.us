import axios from 'axios';

// Get Users
const useFetchUsers = () => {
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { fetchUsers };
};

// Set User as Admin
const useSetAdmin = () => {
  const setAdmin = async (uid: number, isAdmin: boolean) => {
    try {
      const response = await axios.patch(`/users/${uid}`, { isAdmin: isAdmin });
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { setAdmin };
};

// Search for user by Email
const useSearchUser = () => {
  const searchUser = async (email: string) => {
    try {
      const response = await axios.get(`/users/${email}`);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { searchUser };
};


export { useFetchUsers, useSetAdmin, useSearchUser };