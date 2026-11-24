import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { PrismaService } from '../../database/prisma.service';
import { ActivityLocationPort, ActivityWithLocation } from './adapter/activity.location.port';

function actividad(status: string, extra: Partial<ActivityWithLocation> = {}): ActivityWithLocation {
  return {
    id: 'a1',
    title: 'Actividad',
    description: 'Descripción',
    category: 'Deportes',
    city: 'Medellín',
    price: 0,
    capacity: 50,
    startDate: '2999-01-01T00:00:00.000Z',
    status,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    latitude: 6.2,
    longitude: -75.5,
    ...extra,
  } as ActivityWithLocation;
}

describe('ActivityService', () => {
  let prisma: { activity: { updateMany: jest.Mock; update: jest.Mock; count: jest.Mock; create: jest.Mock; delete: jest.Mock } };
  let port: { findAll: jest.Mock; findById: jest.Mock; setCoordinates: jest.Mock };
  let service: ActivityService;

  beforeEach(() => {
    prisma = {
      activity: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 } as never),
        update: jest.fn().mockResolvedValue({} as never),
        count: jest.fn().mockResolvedValue(3 as never),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    port = {
      findAll: jest.fn().mockResolvedValue([] as never),
      findById: jest.fn(),
      setCoordinates: jest.fn(),
    };
    service = new ActivityService(
      prisma as unknown as PrismaService,
      port as unknown as ActivityLocationPort,
    );
  });

  describe('publish / cancel', () => {
    it('publica un borrador con escritura condicionada al estado leído', async () => {
      port.findById
        .mockResolvedValueOnce(actividad('DRAFT') as never)
        .mockResolvedValueOnce(actividad('PUBLISHED') as never);

      const result = await service.publish('a1');

      expect(prisma.activity.updateMany).toHaveBeenCalledWith({
        where: { id: 'a1', status: 'DRAFT' },
        data: { status: 'PUBLISHED' },
      });
      expect(result.status).toBe('PUBLISHED');
    });

    it('cancela una actividad publicada', async () => {
      port.findById
        .mockResolvedValueOnce(actividad('PUBLISHED') as never)
        .mockResolvedValueOnce(actividad('CANCELLED') as never);

      await service.cancel('a1');

      expect(prisma.activity.updateMany).toHaveBeenCalledWith({
        where: { id: 'a1', status: 'PUBLISHED' },
        data: { status: 'CANCELLED' },
      });
    });

    it('transición inválida lanza 409 y no escribe', async () => {
      port.findById.mockResolvedValue(actividad('CANCELLED') as never);

      await expect(service.publish('a1')).rejects.toThrow(ConflictException);
      expect(prisma.activity.updateMany).not.toHaveBeenCalled();
    });

    it('carrera (updateMany count 0) lanza 409', async () => {
      port.findById.mockResolvedValue(actividad('DRAFT') as never);
      prisma.activity.updateMany.mockResolvedValue({ count: 0 } as never);

      await expect(service.publish('a1')).rejects.toThrow(ConflictException);
      await expect(service.cancel('a1')).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it.each(['CANCELLED', 'FINISHED'])('se bloquea en estado %s', async (status) => {
      port.findById.mockResolvedValue(actividad(status) as never);

      await expect(service.update('a1', { title: 'Nuevo' })).rejects.toThrow(ConflictException);
      expect(prisma.activity.update).not.toHaveBeenCalled();
    });

    it('permite editar un borrador', async () => {
      port.findById.mockResolvedValue(actividad('DRAFT') as never);

      await service.update('a1', { title: 'Nuevo' });

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { title: 'Nuevo' },
      });
    });
  });

  describe('visibilidad', () => {
    it('findOne anónimo de un borrador lanza 404', async () => {
      port.findById.mockResolvedValue(actividad('DRAFT') as never);

      await expect(service.findOne('a1')).rejects.toThrow(NotFoundException);
    });

    it('findOne de un usuario sin rol de gestión no ve borradores', async () => {
      port.findById.mockResolvedValue(actividad('DRAFT') as never);

      await expect(service.findOne('a1', { role: 'User' })).rejects.toThrow(NotFoundException);
    });

    it('findOne anónimo de una publicada la devuelve', async () => {
      port.findById.mockResolvedValue(actividad('PUBLISHED') as never);

      await expect((service.findOne('a1'))).resolves.toMatchObject({ id: 'a1' });
    });

    it('findOne de un admin ve un borrador', async () => {
      port.findById.mockResolvedValue(actividad('DRAFT') as never);

      await expect(service.findOne('a1', { role: 'Admin' })).resolves.toMatchObject({ status: 'DRAFT' });
    });

    it('findAll anónimo pasa solo estados públicos al adapter', async () => {
      await service.findAll({});

      expect(port.findAll).toHaveBeenCalledWith({}, ['PUBLISHED']);
    });

    it('findAll de admin y organizador no filtra por estado', async () => {
      port.findAll.mockResolvedValue([actividad('DRAFT'), actividad('CANCELLED', { id: 'a2' })] as never);

      const admin = await service.findAll({}, { role: 'Admin' });
      await service.findAll({}, { role: 'Organizer' });

      expect(port.findAll).toHaveBeenNthCalledWith(1, {}, undefined);
      expect(port.findAll).toHaveBeenNthCalledWith(2, {}, undefined);
      expect(admin).toHaveLength(2);
    });
  });

  it('count() cuenta las actividades', async () => {
    await expect(service.count()).resolves.toBe(3);
  });
});
