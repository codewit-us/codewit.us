// codewit/client/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/oauth2/google/userinfo')
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
