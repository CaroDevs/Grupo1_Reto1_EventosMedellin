import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionUser } from './session';

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useSessionUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
