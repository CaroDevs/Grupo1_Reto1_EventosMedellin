import { describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { UserFactory } from '../../common/users/user.factory';
import { GoogleOAuthStrategy } from '../../common/users/google-oauth.strategy';
import type { GoogleTokenVerifier } from '../../common/auth/google-token-verifier';

describe('AuthService', () => {
  function createService(storedPassword: string | null) {
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

    const userFactory = { create: jest.fn() } as unknown as UserFactory;
    const googleOAuthStrategy = {} as GoogleOAuthStrategy;
    const googleTokenVerifier = { verify: jest.fn() } as unknown as GoogleTokenVerifier;

    return new AuthService(prisma, jwtService, userFactory, googleOAuthStrategy, googleTokenVerifier);
  }

  describe('login', () => {
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
      const userFactory = { create: jest.fn() } as unknown as UserFactory;
      const googleTokenVerifier = { verify: jest.fn() } as unknown as GoogleTokenVerifier;
      const service = new AuthService(
        prisma,
        jwtService,
        userFactory,
        {} as GoogleOAuthStrategy,
        googleTokenVerifier,
      );

      await expect(
        service.login({ email: 'no-existe@example.com', password: 'lo-que-sea' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rechaza una cuenta sin password (creada por Google) con el mismo mensaje', async () => {
      const service = createService(null);

      await expect(
        service.login({ email: 'alguien@example.com', password: 'lo-que-sea' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginWithGoogle', () => {
    it('loguea a un usuario ya existente sin pasar por UserFactory', async () => {
      const googleTokenVerifier = {
        verify: jest.fn().mockResolvedValue({ email: 'alguien@example.com', name: 'Alguien' }),
      } as unknown as GoogleTokenVerifier;

      const prisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'user-1',
            name: 'Alguien',
            email: 'alguien@example.com',
            password: null,
            role: { name: 'User' },
          }),
        },
      } as unknown as PrismaService;
      const jwtService = { signAsync: jest.fn().mockResolvedValue('token-firmado') } as unknown as JwtService;
      const userFactory = { create: jest.fn() } as unknown as UserFactory;
      const service = new AuthService(
        prisma,
        jwtService,
        userFactory,
        {} as GoogleOAuthStrategy,
        googleTokenVerifier,
      );

      const result = await service.loginWithGoogle({ idToken: 'token-de-google' });

      expect(result.accessToken).toBe('token-firmado');
      expect(result.user).not.toHaveProperty('password');
      expect(userFactory.create).not.toHaveBeenCalled();
    });

    it('si es la primera vez, delega en UserFactory con GoogleOAuthStrategy', async () => {
      const googleTokenVerifier = {
        verify: jest.fn().mockResolvedValue({ email: 'nuevo@example.com', name: 'Nuevo' }),
      } as unknown as GoogleTokenVerifier;

      const prisma = {
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      } as unknown as PrismaService;
      const jwtService = { signAsync: jest.fn().mockResolvedValue('token-firmado') } as unknown as JwtService;
      const googleOAuthStrategy = {} as GoogleOAuthStrategy;
      const userFactory = {
        create: jest.fn().mockResolvedValue({
          id: 'user-2',
          name: 'Nuevo',
          email: 'nuevo@example.com',
          role: { name: 'User' },
        }),
      } as unknown as UserFactory;
      const service = new AuthService(prisma, jwtService, userFactory, googleOAuthStrategy, googleTokenVerifier);

      await service.loginWithGoogle({ idToken: 'token-de-google' });

      expect(userFactory.create).toHaveBeenCalledWith(googleOAuthStrategy, {
        email: 'nuevo@example.com',
        name: 'Nuevo',
      });
    });

    it('rechaza si el token de Google no es válido', async () => {
      const googleTokenVerifier = {
        verify: jest.fn().mockRejectedValue(new Error('inválido')),
      } as unknown as GoogleTokenVerifier;

      const prisma = { user: { findUnique: jest.fn() } } as unknown as PrismaService;
      const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
      const userFactory = { create: jest.fn() } as unknown as UserFactory;
      const service = new AuthService(
        prisma,
        jwtService,
        userFactory,
        {} as GoogleOAuthStrategy,
        googleTokenVerifier,
      );

      await expect(service.loginWithGoogle({ idToken: 'token-roto' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
