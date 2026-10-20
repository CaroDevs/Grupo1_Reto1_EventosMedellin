import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { GoogleOAuthStrategy } from './google-oauth.strategy';
import { PrismaService } from '../../database/prisma.service';

describe('GoogleOAuthStrategy', () => {
  it('arma el usuario sin password, con el rol User', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue({ id: 'role-user', name: 'User' }) },
    } as unknown as PrismaService;

    const strategy = new GoogleOAuthStrategy(prisma);
    const data = await strategy.buildUserData({ email: 'alguien@example.com', name: 'Alguien' });

    expect(data.password).toBeNull();
    expect(data.roleId).toBe('role-user');
    expect(data.name).toBe('Alguien');
  });

  it('usa el email como nombre si Google no manda uno', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue({ id: 'role-user', name: 'User' }) },
    } as unknown as PrismaService;

    const strategy = new GoogleOAuthStrategy(prisma);
    const data = await strategy.buildUserData({ email: 'alguien@example.com', name: null });

    expect(data.name).toBe('alguien@example.com');
  });

  it('tira NotFoundException si el rol User no existe', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    const strategy = new GoogleOAuthStrategy(prisma);

    await expect(strategy.buildUserData({ email: 'alguien@example.com' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
