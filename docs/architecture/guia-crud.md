# Guía: cómo armar un CRUD completo (backend + frontend)

Esta guía te lleva paso a paso para agregar una entidad nueva al sistema,
de punta a punta: tabla en la base de datos, endpoints en la API y
pantalla en el frontend que los consume.

Usa como ejemplo una entidad inventada, **`Category`** (categoría de
actividad). **Reemplaza "Category"/"category" por el nombre real de tu
entidad** en todos los pasos (ej. `Participation`, `Organizer`...).

Antes de empezar, lee [stack.md](./stack.md) si no conoces NestJS, Prisma
o React — ahí se explica qué es cada pieza. Esta guía asume que ya sabes
qué es un controller, un service y un componente.

> **Ojo con los conflictos de Git:** varios archivos los va a tocar todo
> el equipo — `apps/api/prisma/schema.prisma`, `apps/api/src/app.module.ts`
> y, del lado del frontend, `apps/web/src/App.tsx` y
> `apps/web/src/shared/layout/NavBar.tsx` (si tu página va en el menú).
> Haz commits chicos y seguido en esos archivos para minimizar conflictos
> al hacer merge.

---

## Parte 1 — Backend (`apps/api`)

### 1. Agrega el modelo en Prisma

Edita [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma)
y agrega tu modelo al final (siguiendo el estilo del modelo `Activity`
que ya existe):

```prisma
model Category {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())

  @@map("categories")
}
```

### 2. Crea la migración

Desde la raíz del proyecto:

```bash
npm run db:migrate -- --name add_category
```

Esto crea el SQL en `apps/api/prisma/migrations/` y lo aplica a tu
Postgres local. Ese archivo de migración se commitea — es lo que hace que
tus compañeros apliquen el mismo cambio al correr `npm run db:migrate`.

### 3. Crea la carpeta del módulo

Dentro de `apps/api/src/modules/` ya existe una carpeta vacía para la
mayoría de entidades planeadas (`discovery`, `participation`, etc.) — usa
la que te corresponda, o crea una nueva si no hay ninguna pensada para tu
entidad (así se hizo con `auth`, que no estaba planeada originalmente).
Crea estos archivos:

```
apps/api/src/modules/category/
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
├── category.controller.ts
├── category.service.ts
└── category.module.ts
```

**`dto/create-category.dto.ts`** — define qué datos espera el `POST` y
los valida automáticamente (gracias al `ValidationPipe` global que ya
está configurado en `main.ts`):

```ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
```

> El `!` después de `name` (no `name: string`) es necesario: con
> `strict: true` TypeScript exige que toda propiedad se inicialice, pero
> un DTO no tiene constructor — lo "llena" NestJS con los datos del
> `POST`, no vos. El `!` le dice a TypeScript "confía, esto se inicializa
> por otro lado". Sin él, da error `TS2564` apenas lo guardás.

**`dto/update-category.dto.ts`** — reutiliza el DTO anterior pero hace
todos los campos opcionales (para el `PATCH`, donde no siempre mandas
todos los campos):

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```

**`category.service.ts`** — la lógica real, usando Prisma:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  findAll() {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
```

**`category.controller.ts`** — expone los endpoints HTTP:

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
```

**`category.module.ts`** — conecta las piezas:

```ts
import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
```

### 4. Registra tu módulo

Edita [`apps/api/src/app.module.ts`](../../apps/api/src/app.module.ts) y
agrega tu módulo a los `imports`:

```ts
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CatalogModule, CategoryModule],
})
export class AppModule {}
```

### 5. Pruébalo

Con la API corriendo (`npm run dev:api`), prueba cada endpoint con curl
(o con una extensión como Thunder Client/REST Client en el editor):

```bash
curl -X POST http://localhost:3000/categories -H "Content-Type: application/json" -d '{"name":"Cultural"}'
curl http://localhost:3000/categories
curl -X PATCH http://localhost:3000/categories/<id> -H "Content-Type: application/json" -d '{"name":"Cultural y arte"}'
curl -X DELETE http://localhost:3000/categories/<id>
```

---

## Parte 2 — Frontend (`apps/web`)

### 1. Crea la carpeta de tu feature

Dentro de `apps/web/src/features/` ya existe una carpeta vacía por
feature planeada. Crea estos archivos (sigue el ejemplo de
[`features/activities`](../../apps/web/src/features/activities), que ya
tiene el patrón de lectura):

```
apps/web/src/features/categories/
├── Category.ts           # el tipo (debe reflejar el modelo de Prisma)
└── CategoriesPanel.tsx    # UI: listar, crear y borrar
```

**`Category.ts`**:

```ts
export interface Category {
  id: string;
  name: string;
  createdAt: string;
}
```

**`CategoriesPanel.tsx`** — ejemplo mínimo con listar, crear y borrar,
usando los helpers de
[`shared/http/client.ts`](../../apps/web/src/shared/http/client.ts):

```tsx
import { useEffect, useState, type SubmitEvent } from 'react';
import { apiDelete, apiGet, apiPost } from '../../shared/http/client';
import type { Category } from './Category';

export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');

  async function loadCategories() {
    setCategories(await apiGet<Category[]>('/categories'));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    await apiPost('/categories', { name });
    setName('');
    await loadCategories();
  }

  async function handleDelete(id: string) {
    await apiDelete(`/categories/${id}`);
    await loadCategories();
  }

  return (
    <section>
      <h2>Categorías</h2>
      <form onSubmit={handleCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nueva categoría" />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <button onClick={() => handleDelete(category.id)}>Borrar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

> Usamos `SubmitEvent`, no `FormEvent` — React 19 marcó `FormEvent` como
> deprecado en sus tipos ("no existe de verdad"); `SubmitEvent` es el
> reemplazo correcto para un `onSubmit`.

### 2. Crea la página de ruta y la conectas

Ya hay router configurado ([React Router](./stack.md#react-router)), así
que tu feature necesita una **página** que la monte, en
`apps/web/src/routes/` (no en `features/` — ahí va la UI y la lógica,
acá solo la "envuelve" para una URL):

```
apps/web/src/routes/public/CategoriesPage.tsx
```

```tsx
import { CategoriesPanel } from '../../features/categories/CategoriesPanel';

export function CategoriesPage() {
  return (
    <div className="container py-4">
      <h1>Categorías</h1>
      <CategoriesPanel />
    </div>
  );
}
```

Después, agrégala a las rutas en
[`App.tsx`](../../apps/web/src/App.tsx):

```tsx
import { CategoriesPage } from './routes/public/CategoriesPage';

// dentro de <Routes>:
<Route path="/categories" element={<CategoriesPage />} />
```

**¿Va en el menú de arriba?** Si querés que aparezca como link en el
`NavBar`, edita
[`shared/layout/NavBar.tsx`](../../apps/web/src/shared/layout/NavBar.tsx)
y agregá un `<li>` más junto al de "Actividades":

```tsx
<li className="nav-item">
  <Link className="nav-link" to="/categories">
    Categorías
  </Link>
</li>
```

Si la página es **solo para administradores** (como el panel de
usuarios), envolvé la ruta con `RequireAdmin` en vez de ponerla directo:

```tsx
import { RequireAdmin } from './shared/auth/RequireAdmin';

<Route
  path="/admin/categories"
  element={
    <RequireAdmin>
      <CategoriesAdminPage />
    </RequireAdmin>
  }
/>
```

Y en el `NavBar`, mostrá el link condicionalmente, igual que ya se hace
con "Administrar usuarios":

```tsx
{user?.role.name === ADMIN_ROLE && (
  <li className="nav-item">
    <Link className="nav-link" to="/admin/categories">
      Categorías
    </Link>
  </li>
)}
```

(`ADMIN_ROLE` sale de `@medellin-activities/shared-types` — ver
[stack.md](./stack.md#el-paquete-shared-types) si no sabes qué es eso.)

### 3. Pruébalo en el navegador

Con `npm run dev` corriendo, abre `http://localhost:5173` y prueba crear
y borrar categorías desde la UI.

---

## Resumen del patrón

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Backend | `prisma/schema.prisma` | Define la tabla |
| Backend | `<entidad>.controller.ts` | Recibe HTTP, delega al service |
| Backend | `<entidad>.service.ts` | Lógica + acceso a datos vía Prisma |
| Backend | `dto/*.dto.ts` | Valida lo que entra por `POST`/`PATCH` |
| Frontend | `features/<entidad>/<Entidad>.ts` | Tipo que refleja el modelo |
| Frontend | `features/<entidad>/*.tsx` | UI + llamadas a la API |
| Frontend | `routes/<área>/<Entidad>Page.tsx` | Página que monta la feature en una URL |
| Compartido | `packages/shared-types` | Valores/tipos que deben ser *idénticos* en los dos lados (ver [stack.md](./stack.md#el-paquete-shared-types)) |

**Ejemplos reales en el repo, según qué estés buscando:**

- **Lo más simple posible (solo lectura):** módulo `catalog` (backend) +
  feature `activities` (frontend) — sin crear/editar/borrar, el punto de
  partida más chico.
- **CRUD completo con relaciones:** módulo `user` (backend) — tiene
  `create`/`findAll`/`findOne`/`update`/`remove`, maneja una relación
  (`roleId` → `Role`) y valida contra `packages/shared-types`.
- **UI completa con modales:** feature `admin` (frontend,
  `UsersAdminPanel.tsx` + `CreateUserModal.tsx` + `EditUserModal.tsx` +
  `ConfirmDeleteModal.tsx`) — si tu CRUD necesita crear/editar/borrar con
  confirmación en vez de la lista simple de esta guía, mejor copiar ese
  patrón que el de `CategoriesPanel` de arriba.
