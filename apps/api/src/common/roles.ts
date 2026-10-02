export const ROLE_NAMES = ['Admin', 'Organizer', 'User'] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const DEFAULT_ROLE: RoleName = 'User';
export const ADMIN_ROLE: RoleName = 'Admin';
