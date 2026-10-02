import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionUser } from './session';
import { ADMIN_ROLE } from '@medellin-activities/shared-types';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useSessionUser();

  if (user?.role.name !== ADMIN_ROLE) {
    return <Navigate to="/activities" replace />;
  }

  return <>{children}</>;
}
