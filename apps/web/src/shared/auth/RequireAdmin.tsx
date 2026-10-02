import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionUser } from './session';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useSessionUser();

  if (!user || user.role.name !== 'Admin') {
    return <Navigate to="/activities" replace />;
  }

  return <>{children}</>;
}
