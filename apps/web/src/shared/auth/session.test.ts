import { describe, expect, it, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  saveSession,
  getSessionUser,
  getSessionToken,
  clearSessionUser,
  useSessionUser,
} from './session';
import type { User } from '../../features/auth/User';

const sampleUser: User = {
  id: 'user-1',
  name: 'Alguien',
  email: 'alguien@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  role: { name: 'User' },
};

describe('session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getSessionUser devuelve null si no hay sesión guardada', () => {
    expect(getSessionUser()).toBeNull();
  });

  it('saveSession guarda el usuario y el token juntos', () => {
    saveSession(sampleUser, 'token-123');

    expect(getSessionUser()).toEqual(sampleUser);
    expect(getSessionToken()).toBe('token-123');
  });

  it('clearSessionUser borra usuario y token', () => {
    saveSession(sampleUser, 'token-123');
    clearSessionUser();

    expect(getSessionUser()).toBeNull();
    expect(getSessionToken()).toBeNull();
  });

  it('useSessionUser se actualiza solo cuando cambia la sesión', () => {
    const { result } = renderHook(() => useSessionUser());

    expect(result.current).toBeNull();

    act(() => {
      saveSession(sampleUser, 'token-123');
    });

    expect(result.current).toEqual(sampleUser);

    act(() => {
      clearSessionUser();
    });

    expect(result.current).toBeNull();
  });
});
