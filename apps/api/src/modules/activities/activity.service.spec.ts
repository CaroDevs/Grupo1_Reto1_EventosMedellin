import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ActivityService } from './activity.service';
import { ActivityLocationPort, ActivityWithLocation } from './activity.location.port';
import { PrismaService } from '../../database/prisma.service';
import { Activity } from '@prisma/client';

// Prueba de que el Adapter (ActivityLocationPort / ActivityLocationAdapter)
// cumple su promesa principal: ActivityService puede probarse por completo
// con un mock del puerto, sin levantar PostgreSQL ni PostGIS.
describe('ActivityService (uso del Adapter de ubicación)', () => {
  let activityService: ActivityService;
  let prisma: jest.Mocked<PrismaService>;
  let locationPort: jest.Mocked<ActivityLocationPort>;

  const baseActivity: Activity = {
    id: 'act-1',
    title: 'Cine al parque',
    description: 'Proyección gratuita',
    category: 'Cultura',
    city: 'Medellín',
    price: 0,
    capacity: 50,
    startDate: new Date('2026-12-01'),
    createdAt: new Date('2026-11-01'),
    updatedAt: new Date('2026-11-01'),
  } as Activity;

  const withLocation: ActivityWithLocation = {
    ...baseActivity,
    latitude: 6.2679,
    longitude: -75.5658,
  };

  beforeEach(() => {
    prisma = {
      activity: {
        create: jest.fn().mockResolvedValue(baseActivity),
        update: jest.fn().mockResolvedValue(baseActivity),
        delete: jest.fn().mockResolvedValue(baseActivity),
        count: jest.fn().mockResolvedValue(1),
      },
    } as unknown as jest.Mocked<PrismaService>;

    locationPort = {
      findAll: jest.fn().mockResolvedValue([withLocation]),
      findById: jest.fn().mockResolvedValue(withLocation),
      setCoordinates: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ActivityLocationPort>;

    activityService = new ActivityService(prisma, locationPort);
  });

  describe('create', () => {
    it('crea la actividad con Prisma y delega las coordenadas en el puerto cuando vienen en el DTO', async () => {
      const result = await activityService.create({
        title: 'Cine al parque',
        category: 'Cultura',
        city: 'Medellín',
        latitude: 6.2679,
        longitude: -75.5658,
      } as any);

      expect(prisma.activity.create).toHaveBeenCalledTimes(1);
      expect(locationPort.setCoordinates).toHaveBeenCalledWith('act-1', 6.2679, -75.5658);
      expect(locationPort.findById).toHaveBeenCalledWith('act-1');
      expect(result).toEqual(withLocation);
    });

    it('no llama a setCoordinates si el DTO no trae latitude/longitude', async () => {
      await activityService.create({
        title: 'Cine al parque',
        category: 'Cultura',
        city: 'Medellín',
      } as any);

      expect(locationPort.setCoordinates).not.toHaveBeenCalled();
    });
  });

  describe('findAll / findOne', () => {
    it('findAll delega los filtros en el puerto', async () => {
      const filters = { category: 'Cultura' };
      const result = await activityService.findAll(filters);

      expect(locationPort.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual([withLocation]);
    });

    it('findOne delega en el puerto por id', async () => {
      const result = await activityService.findOne('act-1');

      expect(locationPort.findById).toHaveBeenCalledWith('act-1');
      expect(result).toEqual(withLocation);
    });
  });

  describe('update', () => {
    it('actualiza los campos planos con Prisma y las coordenadas con el puerto', async () => {
      await activityService.update('act-1', {
        title: 'Cine al parque (reprogramado)',
        latitude: 6.3,
        longitude: -75.6,
      } as any);

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { title: 'Cine al parque (reprogramado)' },
      });
      expect(locationPort.setCoordinates).toHaveBeenCalledWith('act-1', 6.3, -75.6);
    });

    it('no toca las coordenadas si el DTO no las incluye', async () => {
      await activityService.update('act-1', { title: 'Solo cambia el título' } as any);

      expect(locationPort.setCoordinates).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('elimina la actividad vía Prisma', async () => {
      const result = await activityService.remove('act-1');

      expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'act-1' } });
      expect(result).toEqual(baseActivity);
    });
  });

  describe('count', () => {
    it('cuenta todas las actividades directamente con Prisma, sin pasar por el puerto', async () => {
      const result = await activityService.count();

      expect(prisma.activity.count).toHaveBeenCalledTimes(1);
      expect(locationPort.findAll).not.toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });
});
