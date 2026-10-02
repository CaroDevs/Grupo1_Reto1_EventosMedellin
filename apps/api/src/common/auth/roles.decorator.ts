import { SetMetadata } from '@nestjs/common';
import type { RoleName } from '@medellin-activities/shared-types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
