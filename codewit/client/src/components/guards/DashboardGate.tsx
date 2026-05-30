import { Navigate, useParams } from 'react-router-dom';
import LoadingPage from '../loading/LoadingPage';
import { useAuth } from '../../hooks/useAuth';
import { useCourseRole } from '../../hooks/useCourseRole';
import LoginRequiredPrompt from '../auth/LoginRequiredPrompt';

export default function DashboardGate({ children }: { children: JSX.Element }) {
  const { user, loading: authLoading } = useAuth();
  const { courseId } = useParams();
  const { role, loading: roleLoading } = useCourseRole(user ? courseId : undefined);

  if (authLoading) return <LoadingPage />;
  if (!user) return <LoginRequiredPrompt />;
  if (roleLoading) return <LoadingPage />;

  const allowed = user.isAdmin || role === 'instructor';

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
