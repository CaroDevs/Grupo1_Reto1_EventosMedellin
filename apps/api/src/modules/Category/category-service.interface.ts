import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Subject (GoF): el contrato común entre CategoryService (RealSubject) y
// CachedCategoryService (Proxy) — es lo que permite que CategoryController
// dependa de "un servicio de categorías" sin saber cuál de las dos
// implementaciones le llega.
export interface ICategoryService {
  findAll(): Promise<Category[]>;
  findOne(id: string): Promise<Category>;
  create(dto: CreateCategoryDto): Promise<Category>;
  update(id: string, dto: UpdateCategoryDto): Promise<Category>;
  remove(id: string): Promise<Category>;
  count(): Promise<number>;
}

// Igual que con GOOGLE_TOKEN_VERIFIER en auth: TypeScript borra las
// interfaces al compilar, así que no sirven como token de inyección por sí
// solas — este Symbol es el token real, y el módulo decide a qué clase
// concreta apunta.
export const CATEGORY_SERVICE = Symbol('CATEGORY_SERVICE');
