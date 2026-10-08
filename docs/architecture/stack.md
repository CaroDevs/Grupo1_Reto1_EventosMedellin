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
  cada "tabla" de la base de datos como un `model`. Hoy existen `Activity`,
  `User` y `Role`. Cuando hagas tu CRUD, agregas tu propio `model` acá.
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

### bcrypt

**Qué es:** una librería para "hashear" contraseñas — convertirlas en un
texto irreversible antes de guardarlas. Nunca se guarda la contraseña tal
cual el usuario la escribió.

**Para qué lo usamos:** en [`user.service.ts`](../../apps/api/src/modules/user/user.service.ts),
al crear un usuario, `bcrypt.hash(password, 10)` reemplaza la contraseña
antes de guardarla. Al iniciar sesión
([`auth.service.ts`](../../apps/api/src/modules/auth/auth.service.ts)),
`bcrypt.compare(password, user.password)` compara lo que escribió la
persona contra ese hash — nunca se "deshashea" nada, solo se compara.

### JWT (JSON Web Token)

**Qué es:** un "comprobante" firmado digitalmente que demuestra quién
sos, sin que el backend tenga que acordarse de vos entre una petición y
la siguiente. Es un texto (parece basura, tipo
`eyJhbGci...`) que contiene datos (en nuestro caso, el `id` del usuario y
su rol) más una firma que solo el backend puede generar y verificar —
si alguien lo edita a mano, la firma deja de coincidir y el backend lo
rechaza.

**Por qué lo usamos (y por qué no antes):** al principio, `POST
/auth/login` solo verificaba el email/contraseña y devolvía el usuario,
sin ningún comprobante — suficiente mientras no hubiera nada que
proteger. Eso cambió cuando armamos el panel de administración: con
`PATCH /users/:id` cualquiera podía ascender a cualquiera a `Admin`
mandando la petición directo con curl, sin pasar por la UI. Ahí sí hacía
falta una forma de que el backend supiera "esta petición viene
realmente de alguien que inició sesión como admin" — y para eso sirve
JWT.

**Cómo funciona acá, de punta a punta:**

1. Login correcto → [`auth.service.ts`](../../apps/api/src/modules/auth/auth.service.ts)
   firma un token con `jwtService.signAsync({ sub: user.id, role: user.role.name })`
   y lo devuelve junto al usuario: `{ user, accessToken }`.
2. El frontend lo guarda ([`session.ts`](../../apps/web/src/shared/auth/session.ts),
   `saveSession(user, accessToken)`) y lo manda en cada petición siguiente,
   en el header `Authorization: Bearer <token>`
   ([`client.ts`](../../apps/web/src/shared/http/client.ts) lo hace
   automático — no hay que acordarse de agregarlo a mano).
3. En el backend, un endpoint protegido usa
   [`JwtAuthGuard`](../../apps/api/src/common/auth/jwt-auth.guard.ts): lee
   ese header, verifica la firma con el mismo secreto que la generó
   (`JWT_SECRET` en `.env`) y, si es válida, **vuelve a consultar la base
   de datos** para saber el rol *actual* de ese usuario — no confía en el
   rol que venía dentro del token, que pudo quedar desactualizado si a
   esa persona le cambiaron el rol (o la borraron) después de que inició
   sesión. Si el token no es válido o el usuario ya no existe, responde
   `401`.
4. Si además el endpoint necesita un rol específico,
   [`RolesGuard`](../../apps/api/src/common/auth/roles.guard.ts) +
   el decorador `@Roles('Admin')` comparan ese rol (ya actualizado por
   `JwtAuthGuard` en el paso anterior) contra lo que el endpoint exige —
   si no coincide, responde `403`.
5. Si el backend responde `401` (token vencido o inválido),
   `client.ts` borra la sesión local sola — así el frontend nunca se
   queda "logueado" en pantalla con un token que el backend ya no
   acepta.

**Cómo proteger un endpoint o una vista nueva:** ver la sección
["Proteger una ruta nueva"](./guia-crud.md#proteger-una-ruta-nueva) de
la guía de CRUD.

### Login con Google (OAuth)

**Qué es:** en vez de que la persona escriba un email y contraseña
propios de esta app, "Iniciar sesión con Google" deja que Google
confirme quién es, y nuestro backend confía en esa confirmación.

**Por qué este enfoque en particular:** hay dos formas típicas de hacer
"login con Google". La clásica usa *redirects* (tu app manda al
navegador a una URL de Google, Google te devuelve a otra URL tuya con un
código) — pensada para apps que renderiza el servidor. Como somos una
SPA, usamos **Google Identity Services**: Google pone un botón en el
frontend que, al tocarlo, le da directo al navegador un token firmado
(el `idToken`) — sin que el backend tenga que manejar ningún redirect.

**Cómo funciona acá, de punta a punta:**

1. [`GoogleLoginButton.tsx`](../../apps/web/src/features/auth/GoogleLoginButton.tsx)
   renderiza el botón de Google (vía
   [`@react-oauth/google`](https://www.npmjs.com/package/@react-oauth/google),
   que envuelve a Google Identity Services). Al tener éxito, Google le da
   un `credential` (el `idToken`) — nunca pasa por nuestro backend en
   este paso, es directo entre el navegador y Google.
2. El frontend manda ese `idToken` a `POST /auth/google`.
3. [`auth.service.ts`](../../apps/api/src/modules/auth/auth.service.ts)
   le pasa el `idToken` a
   [`GoogleTokenVerifier`](../../apps/api/src/common/auth/google-token-verifier.ts),
   que es quien de verdad usa `google-auth-library` para confirmar que
   lo firmó Google (y que es para *nuestra* app — por eso hace falta el
   `GOOGLE_CLIENT_ID` también en el backend). Si es válido, saca el
   email y nombre ya verificados del payload.

   `AuthService` no conoce `google-auth-library` ni crea su cliente —
   solo conoce la interfaz `GoogleTokenVerifier` (un método: `verify`).
   El enlace entre esa interfaz y `GoogleTokenVerifierImpl` (la que sí
   usa la librería) se hace en `auth.module.ts` con un *injection
   token* (`GOOGLE_TOKEN_VERIFIER`) — en TypeScript no se puede inyectar
   por interfaz directamente (se borran al compilar), así que un
   `Symbol` hace ese papel. Esto es Inversión de Dependencias (la "D"
   de SOLID): si mañana cambia cómo se verifica el token (otra librería,
   otro proveedor de login), solo se cambia `GoogleTokenVerifierImpl` —
   `AuthService` ni se entera. También simplifica los tests: antes había
   que interceptar el `OAuth2Client` real con `jest.spyOn`; ahora
   `auth.service.spec.ts` simplemente pasa un objeto `{ verify: jest.fn() }`.
4. Busca un `User` con ese email. Si existe, lo loguea. Si no existe,
   **lo crea** — con `password` en `null`, porque nunca escribió una.
5. Devuelve `{ user, accessToken }`, exactamente la misma forma que el
   login normal — el frontend no necesita saber si alguien entró con
   contraseña o con Google, lo trata igual de ahí en adelante.

**Por qué `password` es opcional en el modelo `User`:** antes era
obligatorio. Una cuenta creada por Google no tiene — intentar loguearse
con email/contraseña en esa cuenta ahora falla con el mismo mensaje
genérico que cualquier otro intento fallido (no revela que esa cuenta
"solo entra por Google").

**Cómo se crea un usuario de verdad, sea cual sea el camino:** ver la
sección ["El patrón Factory Method"](#el-patrón-factory-method-creación-de-usuarios)
más abajo — con Google fue el momento en que dejó de alcanzar con
código suelto en cada lugar.

**Para configurarlo en tu máquina:** necesitás un Client ID propio de
[Google Cloud Console](https://console.cloud.google.com/) (pantalla de
consentimiento OAuth + credencial "OAuth 2.0 Client ID"), puesto en
`GOOGLE_CLIENT_ID` (`apps/api/.env`) y `VITE_GOOGLE_CLIENT_ID`
(`apps/web/.env`) — el mismo valor en los dos. El Client Secret que te
da Google **no se usa en ningún lado** de este flujo. Mientras el
proyecto esté en "modo de prueba" en Google Cloud Console, solo entran
las cuentas que agregues explícitamente como "usuarios de prueba".

### El patrón Factory Method (creación de usuarios)

**Qué es:** en vez de que cada lugar del código que crea un usuario
repita "buscar el rol, hashear la contraseña si hay, insertar en la
base de datos", esa lógica se separa en dos piezas: una **estrategia**
por cada forma de crear un usuario (sabe armar los datos para *su*
caso), y una **fábrica** única que recibe cualquier estrategia y hace
el `insert` real. Es el patrón creacional `Factory Method` — delegar la
decisión de *cómo* construir algo a una subclase/estrategia, mientras
el código que usa el resultado no necesita saber cuál se usó.

**Por qué recién ahora:** antes había solo dos formas de crear un
usuario (registro normal y Google) — con dos casos cortos, la
abstracción no pagaba. Agregar una tercera (un admin creando un usuario
desde el panel, **eligiendo el rol directo** — algo que el registro
público nunca debería poder hacer) fue el punto donde repetir la misma
lógica tres veces empezaba a doler más que extraerla.

**Las piezas, todas en `apps/api/src/common/users/`:**

| Archivo | Qué hace |
|---|---|
| [`user-creation-strategy.ts`](../../apps/api/src/common/users/user-creation-strategy.ts) | La interfaz: `buildUserData(input)` → `{ name, email, password, roleId }` ya resueltos |
| [`registration.strategy.ts`](../../apps/api/src/common/users/registration.strategy.ts) | Registro público — hashea la contraseña, siempre rol `User` |
| [`google-oauth.strategy.ts`](../../apps/api/src/common/users/google-oauth.strategy.ts) | Login con Google — sin contraseña (`null`), siempre rol `User` |
| [`admin-creation.strategy.ts`](../../apps/api/src/common/users/admin-creation.strategy.ts) | Un admin crea el usuario — hashea la contraseña, usa el rol que el admin eligió |
| [`user.factory.ts`](../../apps/api/src/common/users/user.factory.ts) | La fábrica: le pide los datos a la estrategia que le pasen y hace `prisma.user.create(...)` — ni sabe ni le importa cuál estrategia fue |
| [`user-factory.module.ts`](../../apps/api/src/common/users/user-factory.module.ts) | Módulo de Nest que expone estas piezas — lo importan `UserModule` y `AuthModule` |

**Cómo se usa, en la práctica:**

```ts
// UserService.create() — registro público
return this.userFactory.create(this.registrationStrategy, dto);

// UserService.createByAdmin() — POST /users/admin, protegido con
// JwtAuthGuard + RolesGuard(Admin)
return this.userFactory.create(this.adminCreationStrategy, dto);

// AuthService.loginWithGoogle() — solo si el usuario no existía
await this.userFactory.create(this.googleOAuthStrategy, { email, name });
```

**Por qué es seguro que `AdminCreationStrategy` sí deje elegir el rol,**
cuando a propósito el registro público no puede: porque el único lugar
que la usa (`POST /users/admin`) ya está protegido —
`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('Admin')` — nadie
llega ahí sin ser admin primero. La estrategia en sí no valida permisos,
confía en que el controller que la llama ya lo hizo.

**Si agregan una cuarta forma** (otro proveedor OAuth, importación
masiva por CSV...): crean una estrategia nueva implementando
`UserCreationStrategy`, la agregan a `UserFactoryModule`, y la inyectan
donde haga falta — `UserFactory` no cambia ni se entera.

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

### React Router

**Qué es:** la librería que le da a React la noción de "páginas" —
decide qué componente mostrar según la URL del navegador (`/activities`,
`/login`, `/admin/users`...), sin recargar la página entera.

**Para qué lo usamos:**

- [`main.tsx`](../../apps/web/src/main.tsx) envuelve toda la app en
  `<BrowserRouter>` — una sola vez, al arrancar.
- [`App.tsx`](../../apps/web/src/App.tsx) define las rutas con
  `<Routes>`/`<Route path="..." element={<Página />} />`.
- Cada `<Route>` apunta a un componente de `apps/web/src/routes/` (no de
  `features/` — la distinción está en [guia-crud.md](./guia-crud.md#2-crea-la-página-de-ruta-y-la-conectas)).
- `<Link to="/activities">` reemplaza al `<a href="...">` normal —
  navega sin recargar la página.
- `useNavigate()` navega desde código (ej. después de un login exitoso,
  en vez de desde un click).

### Bootstrap

**Qué es:** una librería de CSS con componentes ya armados (botones,
formularios, tablas, modales, menú de navegación) y un sistema de grilla
responsive — se usa poniendo clases en el `className` del JSX, sin
escribir CSS propio.

**Para qué lo usamos:** es el diseño visual de toda la app. Se importa
una sola vez en [`main.tsx`](../../apps/web/src/main.tsx) (el CSS y el
JS que necesitan los menús/modales para abrirse y cerrarse) y después se
usa en cualquier componente con clases como `btn btn-primary`,
`form-control`, `modal`, `navbar`. La
[documentación oficial de Bootstrap](https://getbootstrap.com/docs/) es
el mejor lugar para buscar qué clase necesitas — no hay que
memorizarlas.

### FontAwesome

**Qué es:** una librería de íconos. Se usan como si fueran texto, con la
etiqueta `<i>` y una clase (ej. `<i className="fa-solid fa-trash" />`).

**Para qué lo usamos:** íconos en botones y menús (ej. el lápiz de
"Editar" o la caneca de "Borrar" en el
[panel de admin](../../apps/web/src/features/admin/UsersAdminPanel.tsx)). Para
buscar el nombre de un ícono nuevo, usa el
[buscador de íconos de FontAwesome](https://fontawesome.com/search?o=r&m=free) y
copia la clase que te muestra (ej. `fa-solid fa-pen`).

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

### El paquete shared-types

**Qué es:** un paquete más del monorepo (como `apps/api` o `apps/web`),
pero sin servidor ni interfaz propia — solo código TypeScript que **los
otros dos importan**. Es la diferencia entre "backend y frontend tienen
cada uno su copia del mismo valor" (hay que acordarse de cambiar las dos
si algo cambia) y "los dos importan el mismo archivo" (cambias un lugar,
los dos se enteran).

**Para qué lo usamos hoy:** los nombres de rol (`'User'`, `'Organizer'`,
`'Admin'`) viven en un solo lugar,
[`packages/shared-types/src/index.ts`](../../packages/shared-types/src/index.ts):

```ts
export const ROLE_NAMES = ['User', 'Organizer', 'Admin'] as const;
export type RoleName = (typeof ROLE_NAMES)[number];
export const DEFAULT_ROLE: RoleName = 'User';
export const ADMIN_ROLE: RoleName = 'Admin';
```

Y se importa igual desde los dos lados:

```ts
import { ROLE_NAMES, ADMIN_ROLE, type RoleName } from '@medellin-activities/shared-types';
```

- En el backend, `ROLE_NAMES` alimenta el `@IsIn(...)` del DTO (valida
  que el rol que llega por `PATCH` sea uno de los válidos).
- En el frontend, el mismo `ROLE_NAMES` llena el `<select>` del modal de
  editar usuario, y `RoleName` tipa el campo `role.name` para que
  TypeScript marque error si comparas mal escrito (`'admin'` en vez de
  `'Admin'`).

**Cuándo usarlo:** cuando un valor o una forma de dato tiene que ser
*exactamente* igual en los dos lados y además puede cambiar (una lista de
roles, de categorías fijas, de estados posibles de algo). No lo uses para
cada tipo — el tipo `Activity` del frontend, por ejemplo, sigue viviendo
solo en `features/activities/Activity.ts`, porque no hay ningún valor
compartido que validar, solo una forma de datos que ya es razonablemente
fácil de mantener sincronizada a mano.

**Cómo agregar algo nuevo ahí:** editas
`packages/shared-types/src/index.ts` y lo exportas. No hace falta
configurar nada más — `apps/api` y `apps/web` ya lo tienen como
dependencia (`"@medellin-activities/shared-types": "*"` en sus
`package.json`), así que el import funciona apenas lo exportes.

> Un detalle técnico si alguna vez agregas más de un archivo ahí adentro:
> los imports relativos internos del paquete necesitan extensión
> explícita (`./algo.js`, no `./algo`) para que funcionen en runtime con
> Node, aunque `tsc` y Vite no se quejen. Por eso hoy todo vive en un solo
> `index.ts` — evita el problema por completo.

## Testing

Hasta hace poco no había ni un solo test en el proyecto. Con lo que ya
hay construido (roles, guards, login, CRUD completo), probar todo a
mano con curl cada vez que se toca algo deja de ser sostenible — un test
corre en segundos y no se olvida de ningún caso.

### Jest (backend)

**Qué es:** el framework de pruebas más usado en el ecosistema Node —
NestJS lo recomienda "de fábrica". Un archivo `algo.spec.ts` al lado de
`algo.ts` describe casos (`it('hace tal cosa', () => {...})`) y compara
resultados esperados contra reales (`expect(resultado).toBe(...)`).

**Cómo lo usamos:** pruebas **unitarias** — sin base de datos real, sin
levantar el servidor. Los `services`/`guards` reciben un `PrismaService`
(o `JwtService`) **falso** (`jest.fn()`), así probamos la lógica sola,
rápido y sin depender de que Postgres esté corriendo. Ejemplos reales:
[`user.service.spec.ts`](../../apps/api/src/modules/user/user.service.spec.ts),
[`jwt-auth.guard.spec.ts`](../../apps/api/src/common/auth/jwt-auth.guard.spec.ts).

**Correrlos:** `npm run test:api` desde la raíz (o `npm test` dentro de
`apps/api`).

> Detalle técnico si te da curiosidad: NestJS 12 publica sus paquetes
> como ESM puro (no CommonJS), y Jest por defecto no puede cargarlos con
> `require()`. Por eso el script de test corre con
> `node --experimental-vm-modules` y los `.spec.ts` importan
> `describe`/`it`/`expect`/`jest` desde `@jest/globals` en vez de usarlos
> como variables globales automáticas — es lo que exige el modo ESM de
> Jest. No hace falta entender esto para escribir un test nuevo, solo
> copiar el patrón de uno que ya exista.

### Vitest (frontend)

**Qué es:** el equivalente a Jest pero integrado con Vite — usa el mismo
motor por debajo, así que no hace falta configurar un transformador de
TypeScript aparte como si hiciera falta con Jest.

**Cómo lo usamos:** con [Testing Library](https://testing-library.com/),
que renderiza un componente real (en un DOM simulado, `jsdom`) y lo
prueba como lo usaría una persona: buscando un input por su label,
escribiendo, haciendo click, y comprobando qué aparece en pantalla — no
se prueban detalles internos de implementación. Ejemplos reales:
[`session.test.ts`](../../apps/web/src/shared/auth/session.test.ts) (lógica
pura, sin renderizar nada),
[`LoginForm.test.tsx`](../../apps/web/src/features/auth/LoginForm.test.tsx) (un
formulario completo, con `apiPost` simulado).

**Correrlos:** `npm run test:web` desde la raíz.

### Los dos juntos

`npm run test` desde la raíz corre primero los del backend y después
los del frontend.

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
