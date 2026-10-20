import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { UserFactory } from '../../common/users/user.factory';
import { RegistrationStrategy } from '../../common/users/registration.strategy';
import { AdminCreationStrategy } from '../../common/users/admin-creation.strategy';

describe('UserService', () => {
  function createService() {
    const prisma = { role: { findUnique: jest.fn() } } as unknown as PrismaService;
    const userFactory = { create: jest.fn().mockResolvedValue({ id: 'user-1' }) } as unknown as UserFactory;
    const registrationStrategy = {} as RegistrationStrategy;
    const adminCreationStrategy = {} as AdminCreationStrategy;

    const service = new UserService(prisma, userFactory, registrationStrategy, adminCreationStrategy);
    return { service, userFactory, registrationStrategy, adminCreationStrategy };
  }

  it('create() delega en UserFactory con RegistrationStrategy', async () => {
    const { service, userFactory, registrationStrategy } = createService();
    const dto = { name: 'Alguien', email: 'alguien@example.com', password: 'contraseña123' };

    await service.create(dto);

    expect(userFactory.create).toHaveBeenCalledWith(registrationStrategy, dto);
  });

  it('createByAdmin() delega en UserFactory con AdminCreationStrategy', async () => {
    const { service, userFactory, adminCreationStrategy } = createService();
    const dto = {
      name: 'Nuevo Organizador',
      email: 'organizador@example.com',
      password: 'contraseña123',
      role: 'Organizer' as const,
    };

    await service.createByAdmin(dto);

    expect(userFactory.create).toHaveBeenCalledWith(adminCreationStrategy, dto);
  });

  describe('update', () => {
    function createServiceWithPrisma() {
      const prisma = {
        role: { findUnique: jest.fn() },
        user: { update: jest.fn() },
      } as unknown as PrismaService;
      const userFactory = { create: jest.fn() } as unknown as UserFactory;
      const service = new UserService(prisma, userFactory, {} as RegistrationStrategy, {} as AdminCreationStrategy);
      return { service, prisma };
    }

    it('traduce el nombre del rol a roleId antes de guardar', async () => {
      const { service, prisma } = createServiceWithPrisma();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-admin', name: 'Admin' });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'hash',
        roleId: 'role-admin',
        role: { name: 'Admin' },
      });

      const result = await service.update('user-1', { role: 'Admin' });

      const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(updateCall.data.roleId).toBe('role-admin');
      expect(result).not.toHaveProperty('password');
    });

    it('tira NotFoundException si el rol pedido no existe', async () => {
      const { service, prisma } = createServiceWithPrisma();
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('user-1', { role: 'Admin' })).rejects.toThrow(NotFoundException);
    });

    it('hashea la contraseña nueva si viene en el update', async () => {
      const { service, prisma } = createServiceWithPrisma();
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Alguien',
        email: 'alguien@example.com',
        password: 'hash',
        roleId: 'role-user',
        role: { name: 'User' },
      });

      await service.update('user-1', { password: 'nuevaContraseña123' });

      const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(updateCall.data.password).not.toBe('nuevaContraseña123');
    });
  });
});
