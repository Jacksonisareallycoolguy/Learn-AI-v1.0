import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { PageLoading } from './Skeleton.jsx';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main id="main" className="center-page">
        <PageLoading label="Checking your session" />
      </main>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
