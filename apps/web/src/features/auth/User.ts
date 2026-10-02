import type { RoleName } from '../../shared/auth/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: {
    name: RoleName;
  };
}