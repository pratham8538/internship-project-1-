import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading, token } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant">Loading…</div>;
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading, token } = useAuth();
  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant">Loading…</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
