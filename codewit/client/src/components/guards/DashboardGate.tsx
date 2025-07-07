import { Navigate, useParams } from 'react-router-dom';
import LoadingPage from '../loading/LoadingPage';
import { useAuth } from '../../hooks/useAuth';
import { useCourseRole } from '../../hooks/useCourseRole';

export default function DashboardGate({ children }: { children: JSX.Element }) {
  const { user, loading: authLoading } = useAuth();
  const { courseId } = useParams();
  const { role, loading: roleLoading } = useCourseRole(courseId);

  if (authLoading || roleLoading) return <LoadingPage />;

  const allowed = user && (user.isAdmin || role === 'instructor');

  return allowed ? children : (
    <Navigate
      to="/error"
      state={{
        message: 'You are not an instructor for this course.',
        statusCode: 404,
      }}
    />
  );
}