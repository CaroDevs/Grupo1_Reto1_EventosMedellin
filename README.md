# Grupo1_Reto1_EventosMedellin
<img width="1405" height="161" alt="image" src="https://github.com/user-attachments/assets/fee271ef-feef-4fff-83cb-151b585a7ea9" />

# Arquitectura Monolito Modular
Para este proyecto se escogió un monolito modular, teniendo presente el equipo pequeño de desarrollo, además de la posibilidad de que tanto el frontend como el backend evolucionan juntos (por ejemplo, un nuevo filtro de descubrimiento) toca ambos lados. Esta arquitectura cumple con las necesidades técnicas de escalabilidad y mantenibilidad del sistema. El enfoque modular nos permite organizar el código en módulos, facilitando la evolución del proyecto. 
Un solo repositorio,  implementa y consume, permitiendo la desincronización entre capas, simplificando la configuración inicial, gracias a que ambos modelos usan el mismo lenguaje. Al mantener la estructura con limites claros, conservamos la posibilidad de separar servicios de forma independiente cuando el proyecto crezca.


## Estructura de carpetas

```text
.
├── apps/
│   ├── api/                   # Backend (NestJS, monolito modular)
│   │   ├── prisma/            # Schema, migraciones y seed de Prisma
│   │   └── src/
│   │       ├── common/        # Utilidades transversales
│   │       │   ├── auth/
│   │       │   ├── errors/
│   │       │   ├── middleware/
│   │       │   ├── pagination/
│   │       │   └── validation/
│   │       ├── config/        # Configuración de la aplicación
│   │       ├── database/      # PrismaService / PrismaModule
│   │       ├── events/        # Eventos de dominio / integración
│   │       └── modules/       # Módulos de negocio (dominio + aplicación)
│   │           ├── admin/
│   │           ├── catalog/   # Único módulo implementado por ahora
│   │           ├── discovery/
│   │           ├── identity/
│   │           ├── media/
│   │           ├── notifications/
│   │           ├── participation/
│   │           └── recomendations/
│   └── web/                   # Frontend (Vite + React + TypeScript)
│       ├── public/
│       └── src/
│           ├── features/      # Flujos orientados al usuario
│           ├── routes/        # Páginas y navegación
│           └── shared/        # Componentes y utilidades compartidas
├── packages/                  # Paquetes compartidos entre apps (aún vacíos)
│   ├── api-client/
│   ├── contracts/
│   ├── shared-types/
│   └── tooling-config/
├── docs/                      # Documentación del proyecto
│   ├── api/
│   ├── architecture/
│   ├── data-model/
│   └── product/
├── infra/
│   └── docker/                # docker-compose.yml de Postgres
└── tools/                     # Scripts y generadores internos
    ├── generators/
    ├── mocks/
    └── scripts/
```

Las carpetas vacías se preservan con un `.gitkeep`. El único módulo de negocio
implementado por ahora es `catalog`, como ejemplo mínimo del patrón modular
(controller → service → Prisma → Postgres); el resto quedan listas para
desarrollarse.

## Cómo levantar el proyecto

Requisitos: Node.js 22+, Docker.

```bash
npm install                 # instala dependencias de api y web (workspaces npm)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

npm run db:up                # levanta Postgres con Docker Compose
npm run db:migrate           # aplica las migraciones de Prisma
npm run db:seed              # inserta actividades de ejemplo

npm run dev                  # corre api (puerto 3000) y web (puerto 5173) juntos
```

La API queda disponible en `http://localhost:3000` (por ahora solo
`GET /activities`) y el frontend en `http://localhost:5173`, consumiéndola.

¿Primera vez con este stack? Lee
[docs/architecture/stack.md](docs/architecture/stack.md): explica qué es
cada tecnología (NestJS, Prisma, PostgreSQL, React, Vite) y cómo se
comunican front y back.

¿Vas a agregar un CRUD nuevo (backend + frontend)? Sigue
[docs/architecture/guia-crud.md](docs/architecture/guia-crud.md), un
paso a paso completo con código de ejemplo.
