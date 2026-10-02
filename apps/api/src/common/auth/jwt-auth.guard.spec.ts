import { describe, expect, it, jest } from '@jest/globals';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

function createContext(authorizationHeader?: string) {
  const request: { headers: Record<string, string | undefined>; user?: unknown } = {
    headers: { authorization: authorizationHeader },
  };

  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe('JwtAuthGuard', () => {
  function createGuard() {
    const jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
    const prisma = {
      user: { findUnique: jest.fn() },
    } as unknown as PrismaService;

    return { guard: new JwtAuthGuard(jwtService, prisma), jwtService, prisma };
  }

  it('rechaza si no mandan el header Authorization', async () => {
    const { guard } = createGuard();
    const { context } = createContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza si el token no es válido', async () => {
    const { guard, jwtService } = createGuard();
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('inválido'));
    const { context } = createContext('Bearer token-roto');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza si el token es válido pero el usuario ya no existe', async () => {
    const { guard, jwtService, prisma } = createGuard();
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-1', role: 'User' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const { context } = createContext('Bearer token-valido');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('usa el rol ACTUAL de la base de datos, no el que venía en el token', async () => {
    const { guard, jwtService, prisma } = createGuard();
    // El token dice "User" (así era cuando se firmó)...
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-1', role: 'User' });
    // ...pero en la base de datos ya es "Admin" (le cambiaron el rol después).
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      role: { name: 'Admin' },
    });
    const { context, request } = createContext('Bearer token-valido');

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(request.user).toEqual({ sub: 'user-1', role: 'Admin' });
  });
});
