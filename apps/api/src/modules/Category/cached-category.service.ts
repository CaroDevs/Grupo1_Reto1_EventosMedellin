import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ICategoryService } from './category-service.interface';

// Cuánto tiempo (ms) se confía en la caché antes de volver a consultar la
// base de datos. Fijo a propósito: NestJS intenta inyectar TODOS los
// parámetros del constructor por tipo, sin excepción para los que tengan
// un valor por defecto — un segundo parámetro `ttlSeconds = 60` rompía el
// arranque de la app porque no hay ningún provider que resuelva un `number`
// suelto (UnknownDependenciesException).
const DEFAULT_TTL_MS = 60_000;

/**
 * Proxy — Caché en memoria de categorías.
 *
 * Mantiene la misma interfaz pública que CategoryService (recibe CategoryService real inyectado).
 * Controla el acceso a findAll() almacenando el resultado en memoria con un TTL (Time-To-Live).
 * Si la caché está vigente la devuelve directo; si no, consulta al servicio real y la refresca.
 * Ante cualquier operación de mutación (create, update, remove), invalida la caché de inmediato.
 */
@Injectable()
export class CachedCategoryService implements ICategoryService {
  private cachedCategories: Category[] | null = null;
  private lastFetchTime = 0;
  private readonly ttlMs = DEFAULT_TTL_MS;

  constructor(private readonly realCategoryService: CategoryService) {}

  async findAll(): Promise<Category[]> {
    const now = Date.now();
    const isCacheExpired = now - this.lastFetchTime > this.ttlMs;

    if (!this.cachedCategories || isCacheExpired) {
      this.cachedCategories = await this.realCategoryService.findAll();
      this.lastFetchTime = now;
    }

    return this.cachedCategories;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const created = await this.realCategoryService.create(dto);
    this.invalidateCache();
    return created;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const updated = await this.realCategoryService.update(id, dto);
    this.invalidateCache();
    return updated;
  }

  async remove(id: string): Promise<Category> {
    const removed = await this.realCategoryService.remove(id);
    this.invalidateCache();
    return removed;
  }

  findOne(id: string): Promise<Category> {
    return this.realCategoryService.findOne(id);
  }

  count(): Promise<number> {
    return this.realCategoryService.count();
  }

  private invalidateCache(): void {
    this.cachedCategories = null;
    this.lastFetchTime = 0;
  }
}
