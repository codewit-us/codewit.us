// codewit/client/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from "@codewit/interfaces"
import axios from 'axios';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/oauth2/google/userInfo')
      .then(response => {
        setUser(response.data.user);
        localStorage.setItem('userId', response.data.user.googleId);
      })
      .catch(error => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    axios.get('/oauth2/google/logout')
      .then(() => {
        setUser(null);
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  };

  return { user, loading, handleLogout };
}
