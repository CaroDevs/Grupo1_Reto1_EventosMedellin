# Justificación de los patrones estructurales

## Patrón 1: Facade (resumen del panel de administración)

### El problema

El panel de administración necesita mostrar, en una sola pantalla, un resumen con el conteo de usuarios, categorías y actividades (las tarjetas de `/admin`). Esa información vive en tres subsistemas completamente independientes — `UserService`, `CategoryService` y `ActivityService` — cada uno con su propio modelo, sus propias reglas de negocio y su propio controller.

Sin un punto de entrada único, resolver esto traía tres problemas concretos:

1. **El frontend tendría que hacer 3 llamadas HTTP distintas** (`GET /users`, `GET /categories`, `GET /activities`) y combinar los resultados por su cuenta cada vez que se necesite el resumen.
2. **El frontend terminaría conociendo detalles internos de cada subsistema** que no le corresponden — por ejemplo, que `GET /activities` por defecto solo devuelve las actividades futuras (así quedó armado para el mapa), algo que un panel de "cuántas actividades existen en total" no debería tener que saber ni filtrar por su cuenta.
3. **Cualquier cambio en cómo se calcula un conteo** (por ejemplo, si más adelante hay que excluir actividades canceladas) obligaría a tocar lógica en el frontend, mezclando presentación con reglas de negocio que no son suyas.

### Por qué Facade resuelve esto

Facade pone una interfaz única y simple delante de un subsistema compuesto por varias piezas, sin que quien la usa necesite conocer cada pieza por separado. `AdminSummaryService` es exactamente esa interfaz: internamente sabe a qué tres services preguntarles y cómo combinar la respuesta — el controller (y, un nivel más arriba, el frontend) solo ven un método, `getSummary()`, que devuelve un objeto plano con los tres totales ya resueltos.

Esto resuelve los tres problemas de arriba: el frontend hace una sola llamada (`GET /admin/summary`), nunca necesita enterarse de cómo cada subsistema calcula su conteo, y si mañana se agrega un cuarto número (por ejemplo, notificaciones pendientes) o cambia la regla de alguno de los tres, el cambio vive adentro del Facade — ni el controller ni el frontend se enteran.

### Diagrama UML

```mermaid
classDiagram
    class AdminSummaryController {
        - adminSummaryService: AdminSummaryService
        + getSummary() Promise~AdminSummary~
    }

    class AdminSummaryService {
        - userService: UserService
        - categoryService: CategoryService
        - activityService: ActivityService
        + getSummary() Promise~AdminSummary~
    }

    class AdminSummary {
        + totalUsers: number
        + totalCategories: number
        + totalActivities: number
    }

    class UserService {
        + count() Promise~number~
    }

    class CategoryService {
        + count() Promise~number~
    }

    class ActivityService {
        + count() Promise~number~
    }

    AdminSummaryController --> AdminSummaryService : "usa"
    AdminSummaryService --> UserService : "orquesta"
    AdminSummaryService --> CategoryService : "orquesta"
    AdminSummaryService --> ActivityService : "orquesta"
    AdminSummaryService ..> AdminSummary : "arma / retorna"
```

### Correspondencia con los participantes del patrón (GoF)

| Participante GoF | Clase en el dominio | Rol |
|---|---|---|
| **Facade** | `AdminSummaryService` | Ofrece una interfaz única (`getSummary()`) hacia un subsistema de tres piezas que no se conocen entre sí. |
| **Subsistema** | `UserService`, `CategoryService`, `ActivityService` | Cada uno resuelve su propio dominio (usuarios, categorías, actividades) con su propia lógica de negocio; no saben que existe el Facade, ni se conocen entre ellos. |
| **Cliente** | `AdminSummaryController` (y, un nivel más arriba, `AdminPanelPage` en el frontend) | Solo conoce al Facade — nunca llama a `UserService`, `CategoryService` o `ActivityService` directamente. |
| **Resultado simplificado** | `AdminSummary` | El objeto plano (3 números) que el Facade arma a partir de las tres consultas internas, listo para que el frontend lo pinte sin procesarlo más. |

### Adaptación al dominio

En el GoF clásico, el Facade suele envolver un subsistema de clases que viven dentro del mismo módulo o archivo. Acá el "subsistema" está formado por tres módulos de NestJS completamente independientes (`UserModule`, `CategoryModule`, `ActivitiesModule`), cada uno con su propio controller, service y DTOs — así que la adaptación al framework consistió en que cada módulo **exporte** su service (`exports: [UserService]`, y lo mismo en los otros dos), y que `AdminModule` los importe para poder inyectarlos en `AdminSummaryService`. Es el mecanismo que NestJS recomienda para compartir providers entre módulos, en vez de, por ejemplo, que el Facade accediera a Prisma directo y reimplementara ahí la lógica de conteo de cada entidad — así `AdminSummaryService` solo orquesta, nunca duplica reglas de negocio que ya le pertenecen a cada subsistema.

## Patrón 2: Adapter
### El problema

Cada actividad tiene una ubicación en el mapa, en la base de datos se guarda en la columna location, que es de tipo geography(Point, 4326) de PostGIS. Prisma no entiende ese tipo, y por eso prisma.activity.create, findMany o update no pueden leerla ni escribirla.

Inicialmente el equipo, para solucionar dicho problema agregamos SQL directamente en ActivityService.
Esto traía cuatro problemas concretos:

1. **El servicio conocía detalles que no le corresponden:** Tenía que saber que ST_MakePoint recibe primero la longitud y luego la latitud, que el sistema de referencia es el 4326 y que hay que castear a geography al escribir y a geometry al leer. Un error en el orden de los parámetros no da error, solo guarda el punto en otro lugar del mapa.
2. **No se podía probar sin base de datos:** Para probar create o findOne hacía falta una base con PostGIS, porque el SQL estaba pegado a la lógica del servicio.
3. **El SQL de ubicación se presentaba en diferentes códigos:** Aparecía en findAll, findOne y setLocation, y además repetido en prisma/seed.ts, un cambio en cómo se guarda la ubicación obligaba a editar el servicio.
### Por qué resuelve esto

El patrón Adapter convierte la interfaz de una clase incompatible en la interfaz que el cliente espera, en este caso, la interfaz incompatible es la de Prisma con SQL y tipos de PostGIS.
La interfaz que el cliente espera es ActivityLocationPort, el ActivityLocationAdapter hace la traducción y el ActivityService depende únicamente del puerto, así que ya no contiene SQL.

Esto resuelve los cuatro problemas:

1. **Responsabilidades separadas:** El servicio solo hace lógica de negocio. Todo lo de PostGIS (orden longitud/latitud, SRID, casteos) vive en un solo archivo.
2. **Pruebas sin base de datos:** Se puede probar ActivityService con un mock de ActivityLocationPort.
3. **SQL centralizado:** Las consultas de ubicación están únicamente en el adapter.
4. **Cambios aislados:** Si cambia la forma de guardar la ubicación, solo se reescribe el adapter, y el servicio y el controlador quedan intactos.
### Diagrama UML

```mermaid
classDiagram
    class ActivityController {
        - activityService: ActivityService
        + create(dto) Promise~Activity~
        + findAll(filters) Promise~Activity[]~
        + findOne(id) Promise~Activity~
        + update(id, dto) Promise~Activity~
        + remove(id) Promise~Activity~
    }
    class ActivityService {
        - prisma: PrismaService
        - locationPort: ActivityLocationPort
        + create(dto) Promise~ActivityWithLocation~
        + findAll(filters) Promise~ActivityWithLocation[]~
        + findOne(id) Promise~ActivityWithLocation~
        + update(id, dto) Promise~ActivityWithLocation~
        + remove(id) Promise~Activity~
        + count() Promise~number~
        - setLocation(id, latitude, longitude) Promise~void~
    }
    class ActivityLocationPort {
        <<abstract>>
        + findAll(filters) Promise~ActivityWithLocation[]~
        + findById(id) Promise~ActivityWithLocation~
        + setCoordinates(id, latitude, longitude) Promise~void~
    }
    class ActivityLocationAdapter {
        - prisma: PrismaService
        + findAll(filters) Promise~ActivityWithLocation[]~
        + findById(id) Promise~ActivityWithLocation~
        + setCoordinates(id, latitude, longitude) Promise~void~
    }
    class ActivityWithLocation {
        + latitude: number
        + longitude: number
    }
    class PrismaService {
        + $queryRawUnsafe(sql, params) Promise~T~
        + $executeRawUnsafe(sql, params) Promise~number~
    }
    ActivityController --> ActivityService : "usa"
    ActivityService --> ActivityLocationPort : "usa"
    ActivityLocationAdapter ..|> ActivityLocationPort : "implementa"
    ActivityLocationAdapter --> PrismaService : "delega (SQL PostGIS)"
    ActivityLocationPort ..> ActivityWithLocation : "retorna"


```

### Correspondencia con los participantes del patrón (GoF)

| Participante GoF | Clase en el dominio | Rol |
|---|---|---|
| | | |

### Adaptación al dominio

## Patrón 3: 
### El problema

### Por qué resuelve esto

### Diagrama UML

```mermaid
classDiagram

```

### Correspondencia con los participantes del patrón (GoF)

| Participante GoF | Clase en el dominio | Rol |
|---|---|---|
| | | |

### Adaptación al dominio
