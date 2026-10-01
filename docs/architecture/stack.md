# Stack técnico: qué usamos y para qué

Este documento explica, en lenguaje simple, cada tecnología del proyecto:
qué es, para qué la usamos y dónde vive en el repo. Está pensado para
alguien que no ha trabajado antes con este stack.

Recuerda la regla de oro del monolito modular: **el backend y el frontend
son dos aplicaciones separadas que se hablan por internet (HTTP/JSON)**, no
un solo programa. Cada una tiene su propia carpeta en `apps/` y su propio
stack.

## Backend (`apps/api`)

### NestJS

**Qué es:** un framework para construir APIs en Node.js con TypeScript.
Piensa en Node.js como el motor que ejecuta JavaScript/TypeScript fuera del
navegador, y NestJS como la "caja de herramientas" que nos da una forma
ordenada de organizar ese código (en vez de que cada quien escriba su API
a su manera).

**Para qué lo usamos:** nos obliga a organizar el código en **módulos**
(uno por funcionalidad: catálogo, identidad, participación...), cada uno
con tres piezas:

| Pieza | Qué hace | Ejemplo en el repo |
|---|---|---|
| **Controller** | Recibe la petición HTTP (`GET /activities`) y decide qué responder | [catalog.controller.ts](../../apps/api/src/modules/catalog/catalog.controller.ts) |
| **Service** | Tiene la lógica de negocio real (buscar, validar, calcular) | [catalog.service.ts](../../apps/api/src/modules/catalog/catalog.service.ts) |
| **Module** | Conecta el controller y el service entre sí | [catalog.module.ts](../../apps/api/src/modules/catalog/catalog.module.ts) |

Cuando hagas tu CRUD, vas a crear exactamente estos 3 archivos dentro de tu
propia carpeta en `apps/api/src/modules/<tu-módulo>`, y luego agregar tu
módulo a la lista de imports en
[app.module.ts](../../apps/api/src/app.module.ts).

### Prisma

**Qué es:** un ORM (Object-Relational Mapper). En lugar de escribir SQL a
mano (`SELECT * FROM activities WHERE...`), describís tus datos en un
archivo (`schema.prisma`) y Prisma genera código TypeScript para
consultarlos, con autocompletado y sin errores de tipeo en nombres de
columnas.

**Para qué lo usamos:**

- [`schema.prisma`](../../apps/api/prisma/schema.prisma): acá se define
  cada "tabla" de la base de datos como un `model`. Ahora mismo solo existe
  `Activity`. Cuando hagas tu CRUD, agregas tu propio `model` acá.
- **Migraciones** (`apps/api/prisma/migrations/`): cada vez que cambias el
  schema, corres `npm run db:migrate` y Prisma genera el SQL necesario
  para actualizar la base de datos real, y lo guarda versionado (así todo
  el equipo aplica los mismos cambios).
- **Prisma Client**: el código autogenerado que usas en el `service` para
  consultar datos, ej. `this.prisma.activity.findMany()`.

### PostgreSQL

**Qué es:** la base de datos. Guarda los datos de verdad (actividades,
usuarios, inscripciones) en disco, de forma permanente.

**Cómo corre:** no se instala directo en tu máquina, corre dentro de un
contenedor Docker (ver [`infra/docker/docker-compose.yml`](../../infra/docker/docker-compose.yml)),
así todo el equipo tiene exactamente la misma versión sin pelear con
instalaciones distintas. Se levanta con `npm run db:up`.

## Frontend (`apps/web`)

### React

**Qué es:** una librería para construir interfaces de usuario a partir de
**componentes**: piezas reutilizables de UI que mezclan HTML, lógica y
estilo en un mismo archivo `.tsx`.

**Para qué lo usamos:** cada parte visual de la app (la lista de
actividades, un formulario, un botón) es un componente. Mira
[`ActivitiesList.tsx`](../../apps/web/src/features/activities/ActivitiesList.tsx)
como ejemplo: pide datos a la API y los pinta en pantalla.

### Vite

**Qué es:** la herramienta que convierte tu código TypeScript/React en
algo que el navegador entiende, y te da un servidor de desarrollo
rapidísimo con recarga automática al guardar (hot reload).

**Para qué lo usamos:** es lo que corre cuando haces `npm run dev:web`.
No escribes código de Vite directamente, solo lo configuras una vez
([`vite.config.ts`](../../apps/web/vite.config.ts)) y después te olvidas
de que existe.

### TypeScript (en ambos lados)

**Qué es:** JavaScript con tipos. Te avisa en el editor, antes de
ejecutar nada, si le estás pasando un número donde se esperaba un texto,
o si olvidaste un campo obligatorio.

**Por qué en los dos lados:** backend y frontend pueden compartir la
forma de los datos. Por ejemplo, el tipo `Activity` del frontend
([`Activity.ts`](../../apps/web/src/features/activities/Activity.ts))
describe exactamente los mismos campos que el `model Activity` de Prisma
en el backend. Si el backend cambia un campo y el frontend no se entera,
TypeScript ayuda a detectarlo más rápido.

## Cómo se comunican

El navegador (React) le hace peticiones HTTP al backend (NestJS) usando
`fetch`, pidiendo o enviando JSON. Ver
[`client.ts`](../../apps/web/src/shared/http/client.ts) para el único
punto donde el frontend sabe "cómo" hablarle a la API.

```
Navegador (React)  --fetch HTTP/JSON-->  NestJS (puerto 3000)  --Prisma-->  PostgreSQL
```

Más detalle de cómo armar tu propio CRUD de punta a punta, paso a paso y
con código completo: [guia-crud.md](./guia-crud.md).
