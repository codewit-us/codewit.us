import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
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
import LoadingPage from '../components/loading/LoadingPage';
import Dashboard from '../pages/Dashboard';


export function App() {
  const { user, loading, handleLogout } = useAuth();
  const [courseTitle, setCourseTitle] = useState<string>(() => {
    return localStorage.getItem('courseTitle') || '';
  });

  useEffect(() => {
    if (courseTitle) {
      localStorage.setItem('courseTitle', courseTitle);
    }
  }, [courseTitle]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full h-screen bg-background-500">
      <NavBar
        name={user ? user.username : ''}
        admin={user ? user.isAdmin : false}
        handleLogout={handleLogout}
        courseTitle={courseTitle}
      />
      <Routes>
        <Route path="/" element={<Home onCourseChange={setCourseTitle} />} />
        <Route path="/read/:uid" element={<Read />} />
        <Route
          path="/usermanagement"
          element={
            user && user.isAdmin ? (
              <UserManagement />
            ) : (
              <Navigate
                to="/error"
                state={{
                  message:
                    'Oops! Page does not exist. We will return you to the main page.',
                  statusCode: 401,
                }}
              />
            )
          }
        />
        <Route
          path="/create"
          element={
            user && user.isAdmin ? (
              <Create />
            ) : (
              <Navigate
                to="/error"
                state={{
                  message:
                    'Oops! Page does not exist. We will return you to the main page.',
                  statusCode: 401,
                }}
              />
            )
          }
        >
          <Route index element={<DemoForms />} />
          <Route path="demo" element={<DemoForms />} />
          <Route path="exercise" element={<ExerciseForms />} />
          <Route path="module" element={<ModuleForm />} />
          <Route path="resource" element={<ResourceForm />} />
          <Route path="course" element={<CourseForm />} />
        </Route>
        <Route
          path="/dashboard"
          element={
            user && user.isAdmin ? (
              <Dashboard
                courseTitle={courseTitle}
              />
            ) : (
              <Navigate
                to="/error"
                state={{
                  message:
                    'Oops! Page does not exist. We will return you to the main page.',
                  statusCode: 401,
                }}
              />
            )
          }
        />
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
