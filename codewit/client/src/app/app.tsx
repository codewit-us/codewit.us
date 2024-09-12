import { Routes, Route, Navigate } from 'react-router-dom';
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

export function App() {
  const { user, loading, handleLogout } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full h-screen bg-background-500">
      <NavBar email={user ? user.email : ''} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/read/:uid" element={<Read />} />
        <Route path="/usermanagement"
          element={user && user.isAdmin ? <UserManagement /> : <Navigate to="/error" state={{ message: 'Unauthorized access.', statusCode: 401 }} />}
        />
        <Route path="/create"
          element={user && user.isAdmin ? <Create /> : <Navigate to="/error" state={{ message: 'Unauthorized access.', statusCode: 401 }} />}
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
