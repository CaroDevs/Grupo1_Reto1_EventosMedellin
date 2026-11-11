import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CachedCategoryService } from './cached-category.service';
import { CategoryService } from './category.service';
import { Category } from '@prisma/client';

describe('CachedCategoryService (Proxy Pattern)', () => {
  let realCategoryService: jest.Mocked<CategoryService>;
  let cachedCategoryService: CachedCategoryService;

  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Deportes',
      description: 'Actividades deportivas',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'cat-2',
      name: 'Música',
      description: 'Conciertos y festivales',
      createdAt: new Date('2026-01-02'),
    },
  ];

  beforeEach(() => {
    realCategoryService = {
      findAll: jest.fn<() => Promise<Category[]>>().mockResolvedValue(mockCategories),
      count: jest.fn<() => Promise<number>>().mockResolvedValue(2),
      findOne: jest.fn<(id: string) => Promise<Category>>().mockResolvedValue(mockCategories[0]),
      create: jest.fn().mockImplementation((dto) =>
        Promise.resolve({
          id: 'cat-3',
          createdAt: new Date(),
          ...(dto as { name: string; description: string }),
        }),
      ),
      update: jest.fn().mockImplementation((id, dto) =>
        Promise.resolve({
          ...mockCategories[0],
          id,
          ...(dto as { name?: string; description?: string }),
        }),
      ),
      remove: jest.fn().mockResolvedValue(mockCategories[0]),
    } as unknown as jest.Mocked<CategoryService>;

    // El TTL ya no es un parámetro del constructor (ver cached-category.service.ts)
    // — queda fijo en 60s adentro de la clase, los tests de abajo asumen ese valor.
    cachedCategoryService = new CachedCategoryService(realCategoryService);
  });

  describe('findAll (Caché con TTL)', () => {
    it('consulta al servicio real en la primera llamada', async () => {
      const result = await cachedCategoryService.findAll();

      expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });

    it('devuelve el resultado en memoria sin volver a consultar al servicio real si el TTL está vigente (Cache Hit)', async () => {
      await cachedCategoryService.findAll();
      const secondResult = await cachedCategoryService.findAll();
      const thirdResult = await cachedCategoryService.findAll();

      expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);
      expect(secondResult).toEqual(mockCategories);
      expect(thirdResult).toEqual(mockCategories);
    });

    it('vuelve a consultar al servicio real cuando el TTL expira', async () => {
      const realDateNow = Date.now;
      let currentTime = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

      try {
        await cachedCategoryService.findAll();
        expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);

        // Avanzamos 30 segundos (dentro del TTL de 60s) -> no consulta de nuevo
        currentTime += 30 * 1000;
        await cachedCategoryService.findAll();
        expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);

        // Avanzamos 31 segundos más (61s en total, TTL vencido) -> consulta de nuevo
        currentTime += 31 * 1000;
        await cachedCategoryService.findAll();
        expect(realCategoryService.findAll).toHaveBeenCalledTimes(2);
      } finally {
        Date.now = realDateNow;
      }
    });
  });

  describe('Invalidación de caché ante operaciones de mutación', () => {
    it('create() delega en el servicio real e invalida la caché para que el siguiente findAll() consulte la BD', async () => {
      await cachedCategoryService.findAll();
      expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);

      const newCategory = await cachedCategoryService.create({
        name: 'Cultura',
        description: 'Eventos culturales',
      });

      expect(realCategoryService.create).toHaveBeenCalledWith({
        name: 'Cultura',
        description: 'Eventos culturales',
      });
      expect(newCategory.name).toBe('Cultura');

      // Al llamar a findAll() inmediatamente después, la caché fue invalidada
      await cachedCategoryService.findAll();
      expect(realCategoryService.findAll).toHaveBeenCalledTimes(2);
    });

    it('update() delega en el servicio real e invalida la caché', async () => {
      await cachedCategoryService.findAll();
      expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);

      await cachedCategoryService.update('cat-1', { name: 'Deportes Extremos' });

      expect(realCategoryService.update).toHaveBeenCalledWith('cat-1', {
        name: 'Deportes Extremos',
      });

      await cachedCategoryService.findAll();
      expect(realCategoryService.findAll).toHaveBeenCalledTimes(2);
    });

    it('remove() delega en el servicio real e invalida la caché', async () => {
      await cachedCategoryService.findAll();
      expect(realCategoryService.findAll).toHaveBeenCalledTimes(1);

      await cachedCategoryService.remove('cat-1');

      expect(realCategoryService.remove).toHaveBeenCalledWith('cat-1');

      await cachedCategoryService.findAll();
      expect(realCategoryService.findAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Delegación directa', () => {
    it('findOne() delega directamente al servicio real con el ID correspondiente', async () => {
      const result = await cachedCategoryService.findOne('cat-1');

      expect(realCategoryService.findOne).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(mockCategories[0]);
    });

    it('count() delega directamente al servicio real', async () => {
      const result = await cachedCategoryService.count();

      expect(realCategoryService.count).toHaveBeenCalledTimes(1);
      expect(result).toBe(2);
    });
  });
});
