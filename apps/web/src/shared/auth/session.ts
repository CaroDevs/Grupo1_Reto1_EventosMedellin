import { useEffect, useState } from 'react';
import type { User } from '../../features/auth/User';

const SESSION_KEY = 'session-user';
const SESSION_CHANGED_EVENT = 'session-changed';

export function saveSessionUser(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getSessionUser(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearSessionUser(): void {
  localStorage.removeItem(SESSION_KEY);
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
