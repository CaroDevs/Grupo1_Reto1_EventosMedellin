import { describe, expect, it, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';

function createPrismaMock() {
  return {
    role: { findUnique: jest.fn() },
    user: { create: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
}

describe('UserService', () => {
  describe('create', () => {
    it('hashea la contraseña y asigna el rol por defecto (User)', async () => {
      const prisma = createPrismaMock();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-user', name: 'User' });
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'hash-guardado',
        roleId: 'role-user',
      });

      const service = new UserService(prisma);
      const result = await service.create({
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'contraseña123',
      });

      // El rol que se le pide a Prisma es "User", no lo que mande el cliente
      // (CreateUserDto ni siquiera tiene campo role).
      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'User' } });

      // La contraseña que llega a prisma.user.create ya está hasheada, no es
      // la original en texto plano.
      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.password).not.toBe('contraseña123');
      expect(await bcrypt.compare('contraseña123', createCall.data.password)).toBe(true);

      // La respuesta nunca incluye la contraseña, ni hasheada.
      expect(result).not.toHaveProperty('password');
    });

    it('tira ConflictException si el email ya existe (P2002 de Prisma)', async () => {
      const prisma = createPrismaMock();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-user', name: 'User' });
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      const service = new UserService(prisma);

      await expect(
        service.create({ name: 'Alguien', email: 'repetido@example.com', password: 'contraseña123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('tira NotFoundException si el rol User no existe (falta correr el seed)', async () => {
      const prisma = createPrismaMock();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const service = new UserService(prisma);

      await expect(
        service.create({ name: 'Alguien', email: 'alguien@example.com', password: 'contraseña123' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('traduce el nombre del rol a roleId antes de guardar', async () => {
      const prisma = createPrismaMock();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-admin', name: 'Admin' });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'hash',
        roleId: 'role-admin',
        role: { name: 'Admin' },
      });

      const service = new UserService(prisma);
      const result = await service.update('user-1', { role: 'Admin' });

      const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.roleId).toBe('role-admin');
      expect(result).not.toHaveProperty('password');
    });

    it('tira NotFoundException si el rol pedido no existe', async () => {
      const prisma = createPrismaMock();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const service = new UserService(prisma);

      await expect(service.update('user-1', { role: 'Admin' })).rejects.toThrow(NotFoundException);
    });

    it('hashea la contraseña nueva si viene en el update', async () => {
      const prisma = createPrismaMock();
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'hash',
        roleId: 'role-user',
        role: { name: 'User' },
      });

      const service = new UserService(prisma);
      await service.update('user-1', { password: 'nuevaContraseña123' });

      const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.password).not.toBe('nuevaContraseña123');
      expect(await bcrypt.compare('nuevaContraseña123', updateCall.data.password)).toBe(true);
    });
  });
});
