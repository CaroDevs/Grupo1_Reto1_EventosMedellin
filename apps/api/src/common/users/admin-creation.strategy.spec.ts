import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminCreationStrategy } from './admin-creation.strategy';
import { PrismaService } from '../../database/prisma.service';

describe('AdminCreationStrategy', () => {
  it('hashea la contraseña y usa el rol que eligió el admin (no uno fijo)', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue({ id: 'role-organizer', name: 'Organizer' }) },
    } as unknown as PrismaService;

    const strategy = new AdminCreationStrategy(prisma);
    const data = await strategy.buildUserData({
      name: 'Nuevo Organizador',
      email: 'organizador@example.com',
      password: 'contraseña123',
      role: 'Organizer',
    });

    expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'Organizer' } });
    expect(data.roleId).toBe('role-organizer');
    expect(await bcrypt.compare('contraseña123', data.password!)).toBe(true);
  });

  it('tira NotFoundException si el rol elegido no existe', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    const strategy = new AdminCreationStrategy(prisma);

    await expect(
      strategy.buildUserData({
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'contraseña123',
        role: 'Admin',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
