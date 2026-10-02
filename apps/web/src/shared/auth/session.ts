import { useEffect, useState } from 'react';
import type { User } from '../../features/auth/User';

const SESSION_KEY = 'session-user';
const TOKEN_KEY = 'session-token';
const SESSION_CHANGED_EVENT = 'session-changed';

export function saveSession(user: User, accessToken: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, accessToken);
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getSessionUser(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function getSessionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSessionUser(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function useSessionUser(): User | null {
  const [user, setUser] = useState<User | null>(() => getSessionUser());

  useEffect(() => {
    const syncUser = () => setUser(getSessionUser());
    window.addEventListener(SESSION_CHANGED_EVENT, syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  return user;
}
