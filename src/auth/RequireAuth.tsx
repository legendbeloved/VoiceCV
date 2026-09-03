import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (loading) return <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center text-sm font-bold text-[var(--muted)]">Checking your session…</div>;
  if (!configured) return <Navigate to="/login" replace state={{ from: location, configurationRequired: true }} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}
