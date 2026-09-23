# Grupo1_Reto3_EventosMedellin
<img width="1405" height="161" alt="image" src="https://github.com/user-attachments/assets/fee271ef-feef-4fff-83cb-151b585a7ea9" />

# Arquitectura Monolito Modular
Para este proyecto se escogió un monolito modular, teniendo presente el equipo pequeño de desarrollo, además de la posibilidad de que tanto el frontend como el backend evolucionan juntos (por ejemplo, un nuevo filtro de descubrimiento) toca ambos lados. Esta arquitectura cumple con las necesidades técnicas de escalabilidad y mantenibilidad del sistema. El enfoque modular nos permite organizar el código en módulos, facilitando la evolución del proyecto. 
Un solo repositorio,  implementa y consume, permitiendo la desincronización entre capas, simplificando la configuración inicial, gracias a que ambos modelos usan el mismo lenguaje. Al mantener la estructura con limites claros, conservamos la posibilidad de separar servicios de forma independiente cuando el proyecto crezca.


## Estructura de carpetas

```text
apps/
├── api/                    # Backend (API REST, monolito modular)
│   ├── src/
│   │   ├── common/         # Utilidades transversales
│   │   │   ├── auth/
│   │   │   ├── errors/
│   │   │   ├── middleware/
│   │   │   ├── pagination/
│   │   │   └── validation/
│   │   ├── config/         # Configuración de la aplicación
│   │   ├── database/       # Acceso a datos
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── events/         # Eventos de dominio / integración
│   │   └── modules/        # Módulos de negocio (dominio + aplicación)
│   │       ├── admin/
│   │       ├── catalog/
│   │       ├── discovery/
│   │       ├── identity/
│   │       ├── media/
│   │       ├── notifications/
│   │       ├── participation/
│   │       └── recomendations/
│   └── test/
├── web/                     # Frontend (SPA)
│   ├── public/
│   ├── src/
│   │   ├── features/        # Flujos orientados al usuario
│   │   │   ├── activities/
│   │   │   ├── auth/
│   │   │   ├── discovery/
│   │   │   ├── map/
│   │   │   ├── notifications/
│   │   │   ├── onboarding/
│   │   │   ├── organizer-panel/
│   │   │   └── recommendations/
│   │   ├── routes/          # Páginas y navegación
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── organizer/
│   │   │   ├── public/
│   │   │   └── user/
│   │   └── shared/          # Componentes y utilidades compartidas
│   │       ├── config/
│   │       ├── http/
│   │       ├── layout/
│   │       ├── ui/
│   │       └── utils/
│   └── test/
├── packages/                # Paquetes compartidos entre apps
│   ├── api-client/
│   ├── contracts/
│   ├── shared-types/
│   └── tooling-config/
├── docs/                    # Documentación del proyecto
│   ├── api/
│   ├── architecture/
│   ├── data-model/
│   └── product/
└── tools/                   # Scripts y generadores internos
    ├── generators/
    ├── mocks/
    └── scripts/
```