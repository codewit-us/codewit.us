import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/nav/Nav';
import Home from '../pages/Home';
import CourseView from "../pages/CourseView";
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
import TeacherView from '../pages/course/TeacherView';
import DashboardGate from '../components/guards/DashboardGate';

export function App() {
  const { user, loading, handleLogout } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [courseTitle, setCourseTitle] = useState<string>(() =>
     localStorage.getItem('courseTitle') || '',
   );
 
   const [courseId, setCourseId] = useState<string>(() =>
     localStorage.getItem('courseId') || '',
   ); 

  useEffect(() => {
    if (courseTitle) {
      localStorage.setItem('courseTitle', courseTitle);
    }
    if (courseId) { 
      localStorage.setItem('courseId', courseId);
  }
  }, [courseTitle, courseId]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full h-screen bg-background-500">
      <NavBar
        name={user ? user.username : ''}
        admin={user ? user.isAdmin : false}
        handleLogout={handleLogout}
        courseTitle={isLandingPage ? '' : courseTitle}
        courseId={courseId}
      />
      <Routes>
        <Route
          path="/"
          element={ <Home /> }
        />
        <Route
          path="/:course_id"
          element={<CourseView onCourseChange={setCourseTitle} />}
        />
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
          path="/:courseId/dashboard"
          element={
            <DashboardGate>
              <TeacherView onCourseChange={setCourseTitle} />
            </DashboardGate>
          }
        />
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
