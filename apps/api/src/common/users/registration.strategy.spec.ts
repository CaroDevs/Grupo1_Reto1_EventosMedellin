import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegistrationStrategy } from './registration.strategy';
import { PrismaService } from '../../database/prisma.service';

describe('RegistrationStrategy', () => {
  it('hashea la contraseña y siempre asigna el rol User', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue({ id: 'role-user', name: 'User' }) },
    } as unknown as PrismaService;

    const strategy = new RegistrationStrategy(prisma);
    const data = await strategy.buildUserData({
      name: 'Alguien',
      email: 'alguien@example.com',
      password: 'contraseña123',
    });

    expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'User' } });
    expect(data.password).not.toBe('contraseña123');
    expect(await bcrypt.compare('contraseña123', data.password!)).toBe(true);
    expect(data.roleId).toBe('role-user');
  });

  it('tira NotFoundException si el rol User no existe (falta correr el seed)', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    const strategy = new RegistrationStrategy(prisma);

    await expect(
      strategy.buildUserData({ name: 'Alguien', email: 'alguien@example.com', password: 'contraseña123' }),
    ).rejects.toThrow(NotFoundException);
  });
});
