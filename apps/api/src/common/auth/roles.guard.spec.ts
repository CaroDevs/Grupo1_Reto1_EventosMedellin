import { describe, expect, it, jest } from '@jest/globals';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { JwtPayload } from './jwt-auth.guard';

function createContext(user?: JwtPayload): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  function createGuard(requiredRoles: string[] | undefined) {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(requiredRoles) } as unknown as Reflector;
    return new RolesGuard(reflector);
  }

  it('deja pasar si el endpoint no tiene @Roles()', () => {
    const guard = createGuard(undefined);
    const context = createContext({ sub: 'user-1', role: 'User' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deja pasar si el rol del usuario está en la lista permitida', () => {
    const guard = createGuard(['Admin']);
    const context = createContext({ sub: 'user-1', role: 'Admin' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rechaza si el rol del usuario no está en la lista permitida', () => {
    const guard = createGuard(['Admin']);
    const context = createContext({ sub: 'user-1', role: 'User' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rechaza si no hay usuario en la petición', () => {
    const guard = createGuard(['Admin']);
    const context = createContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
