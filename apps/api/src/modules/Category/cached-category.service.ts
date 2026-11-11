import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * Proxy — Caché en memoria de categorías.
 *
 * Mantiene la misma interfaz pública que CategoryService (recibe CategoryService real inyectado).
 * Controla el acceso a findAll() almacenando el resultado en memoria con un TTL (Time-To-Live).
 * Si la caché está vigente la devuelve directo; si no, consulta al servicio real y la refresca.
 * Ante cualquier operación de mutación (create, update, remove), invalida la caché de inmediato.
 */
@Injectable()
export class CachedCategoryService {
  private cachedCategories: Category[] | null = null;
  private lastFetchTime = 0;
  private readonly ttlMs: number;

  constructor(
    private readonly realCategoryService: CategoryService,
    ttlSeconds = 60,
  ) {
    this.ttlMs = ttlSeconds * 1000;
  }

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
