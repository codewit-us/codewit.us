import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
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
import { ErrorPage } from '../components/error/Error';
import LoadingPage from '../components/loading/LoadingPage';
import TeacherView from '../pages/course/TeacherView';
import DashboardGate from '../components/guards/DashboardGate';
import axios from 'axios';

const TOP_LEVEL = new Set(['', 'create', 'usermanagement', 'read', 'settings', 'login', 'error']);

export function App() {
  const { user, loading, handleLogout } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const isLandingPage = location.pathname === '/';
  const isUserManagement = location.pathname.startsWith('/usermanagement');
  
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

   // Get course from /api/courses/landing
  useEffect(() => {
    if (user?.isAdmin && !courseId) {
      axios.get('/api/courses/landing')
        .then(({ data }) => {
          const first = data?.instructor?.[0];
          if (first?.id && first?.title) {
            setCourseId(first.id);
            setCourseTitle(first.title);
          }
        })
        .catch(() => {});
    }
  }, [user?.isAdmin, courseId]);
  
  // Derive courseId from the current URL for students (and /read)
  useEffect(() => {
    const segs = location.pathname.split('/').filter(Boolean);

    // "/:courseId"
    if (segs.length === 1 && !TOP_LEVEL.has(segs[0])) {
      if (segs[0] !== courseId) setCourseId(segs[0]);
      return;
    }
    // "/:courseId/dashboard"
    if (segs.length === 2 && segs[1] === 'dashboard' && !TOP_LEVEL.has(segs[0])) {
      if (segs[0] !== courseId) setCourseId(segs[0]);
      return;
    }
    // read page: ?course_id=...
    const qp = searchParams.get('course_id');
    if (qp && qp !== courseId) setCourseId(qp);
  }, [location.pathname, location.search, courseId]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-screen h-screen flex flex-col flex-nowrap bg-background-500">
      <NavBar
        name={user ? user.username : ''}
        admin={user ? user.isAdmin : false}
        handleLogout={handleLogout}
        courseTitle={isLandingPage ? '' : courseTitle}
      />
      <div className="relative flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={<Home />}
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
                      'Oops! You do not have permission to access this page.\nPress the button below to return to the main page.',
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
                      'Oops! You do not have permission to access this page.\nPress the button below to return to the main page.',
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
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
