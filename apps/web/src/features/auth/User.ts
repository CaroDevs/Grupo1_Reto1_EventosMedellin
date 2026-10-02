import type { RoleName } from '@medellin-activities/shared-types';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: {
    name: RoleName;
  };
}