export const ROLE_NAMES = ['User', 'Organizer', 'Admin'] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const DEFAULT_ROLE: RoleName = 'User';
export const ADMIN_ROLE: RoleName = 'Admin';
export const ORGANIZER_ROLE: RoleName = 'Organizer';
