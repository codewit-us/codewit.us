// App.tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/nav/Nav';
import Home from '../pages/Home';
import Read from '../pages/Read';
import Create from '../pages/Create';
import NotFound from '../components/notfound/NotFound';
import ExerciseForms from '../pages/ExerciseForm';
import ModuleForm from '../pages/ModuleForm';
import ResourceForm from '../pages/ResourceForm';
import CourseForm from '../pages/CourseForm';
import DemoForms from '../pages/DemoForm';
import UserManagement from '../pages/UserManagement';
import Error from '../components/error/Error';

export function App() {
  const [user, setUser] = useState<{ email: string; googleId: string; isAdmin: boolean; name: string } | null>(null);

  useEffect(() => {
    axios.get('/oauth2/google/userinfo')
      .then((response) => {
        setUser(response.data.user);
      }).catch(() => {
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    axios.get('/oauth2/google/logout')
      .then(() => {
        setUser(null);
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <div className="w-full h-screen bg-background-500">
      <NavBar email={user ? user.email : ''} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/read/:uid" element={<Read />} />

        <Route
          path="/usermanagement"
          element={user && user.isAdmin ? <UserManagement /> : <Navigate to="/error" state={{ message: 'Oops! Page does not exist. We will return you to the main page.', statusCode: 401 }} />}
        />
        <Route
          path="/create"
          element={user && user.isAdmin ? <Create /> : <Navigate to="/error" state={{ message: 'Oops! Page does not exist. We will return you to the main page.', statusCode: 401 }} />}
        >
          <Route index element={<DemoForms />} />
          <Route path="demo" element={<DemoForms />} />
          <Route path="exercise" element={<ExerciseForms />} />
          <Route path="module" element={<ModuleForm />} />
          <Route path="resource" element={<ResourceForm />} />
          <Route path="course" element={<CourseForm />} />
        </Route>

        <Route path="/error" element={<Error />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
