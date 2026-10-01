import type { User } from '../../features/auth/User';

const SESSION_KEY = 'session-user';

export function saveSessionUser(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSessionUser(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearSessionUser(): void {
  localStorage.removeItem(SESSION_KEY);
}
