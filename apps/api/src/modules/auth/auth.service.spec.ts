import { describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuthService', () => {
  function createService(storedPassword: string) {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          name: 'Alguien',
          email: 'alguien@example.com',
          password: storedPassword,
          role: { name: 'User' },
        }),
      },
    } as unknown as PrismaService;

    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('token-firmado'),
    } as unknown as JwtService;

    return new AuthService(prisma, jwtService);
  }

  it('devuelve el usuario (sin password) y un accessToken si las credenciales son correctas', async () => {
    const hash = await bcrypt.hash('contraseña123', 10);
    const service = createService(hash);

    const result = await service.login({ email: 'alguien@example.com', password: 'contraseña123' });

    expect(result.accessToken).toBe('token-firmado');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('alguien@example.com');
  });

  it('rechaza con el mismo mensaje si la contraseña es incorrecta', async () => {
    const hash = await bcrypt.hash('contraseña123', 10);
    const service = createService(hash);

    await expect(
      service.login({ email: 'alguien@example.com', password: 'otra-cosa' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza con el mismo mensaje si el email no existe (no revela cuál de los dos falló)', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
    const service = new AuthService(prisma, jwtService);

    await expect(
      service.login({ email: 'no-existe@example.com', password: 'lo-que-sea' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
