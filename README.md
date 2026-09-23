# Grupo1_Reto3_EventosMedellin
<img width="1405" height="161" alt="image" src="https://github.com/user-attachments/assets/fee271ef-feef-4fff-83cb-151b585a7ea9" />

# Arquitectura Monolito Modular
Para este proyecto elegimos un monolito modular porque el equipo de desarrollo es pequeño, el plazo es corto y front y back evolucionan juntos: casi cada funcionalidad (por ejemplo, un nuevo filtro de descubrimiento) toca ambos lados. Con un solo repositorio, ese cambio entra en un único pull request, con el contrato de la API (Open API) versionado junto al código que lo implementa y lo consume, lo que evita desincronizaciones entre capas.
Además, simplifica la configuración inicial, ya que hay un solo lugar para todo, si ambos lados usan el mismo lenguaje. Al mantener límites claros entre las apps, conservamos la posibilidad de separar servicios o desplegarlos de forma independiente cuando el proyecto crezca.
También tuvimos en cuenta la posibilidad de implementar la arquitectura hexagonal, para el desacoplamiento de dependencias, pero al tener en cuenta que esta misma arquitectura con una buena estructuración permite facilitar la evolución del sistema.
 



ESP PADISOF

Plataforma para descubrir y participar en actividades y experiencias culturales,
deportivas, educativas y comunitarias de Medellín.

## 1. Alcance de esta entrega

Esta entrega establece la organización inicial del proyecto y sus decisiones
arquitectónicas. No incluye código fuente ni una implementación funcional.

Se crean dos áreas separadas:

- **Backend**: API, reglas de negocio, persistencia y servicios de la plataforma.
- **Frontend**: aplicación web con la que las personas consultan actividades,
  aplican filtros, revisan detalles y gestionan su participación.

La separación permite que ambos equipos trabajen y evolucionen de manera
independiente, manteniendo un contrato claro de comunicación mediante HTTP/JSON.

## 2. Análisis del reto

### Problema

En Medellín existe una oferta amplia de actividades, pero la información suele
estar dispersa entre redes sociales, sitios institucionales, carteleras y
comunidades. Esto dificulta responder rápidamente:

- ¿Qué actividades están disponibles?
- ¿Dónde y cuándo se realizan?
- ¿Son gratuitas o tienen costo?
- ¿La actividad coincide con mis intereses, accesibilidad y disponibilidad?
- ¿Cómo puedo reservar o confirmar mi participación?

### Usuarios y actores

1. **Persona participante**: explora actividades, filtra resultados, consulta
   detalles, se registra y administra sus participaciones.
2. **Organizador**: publica actividades, administra cupos, fechas, ubicación y
   participantes.
3. **Administrador**: valida contenido, modera publicaciones y supervisa la
   calidad de la información.

### Propuesta de solución

La plataforma centraliza experiencias verificadas y permite descubrirlas por
categoría, fecha, zona de Medellín, modalidad, costo, accesibilidad y
disponibilidad de cupos. Cada actividad tendrá una ficha con información
consistente: descripción, organizador, ubicación, horarios, requisitos, cupos
e instrucciones de inscripción.

### Flujo principal

1. La persona entra a la plataforma y selecciona intereses o filtros.
2. El Frontend solicita al Backend actividades compatibles.
3. La persona consulta el detalle de una actividad.
4. Si hay cupo, inicia sesión o se registra y confirma su participación.
5. El sistema registra la inscripción y muestra una confirmación.
6. El organizador consulta y administra sus actividades y participantes.

### Requisitos funcionales iniciales

- Registro e inicio de sesión.
- Catálogo de actividades con búsqueda y filtros.
- Vista de detalle de una actividad.
- Inscripción, cancelación y consulta de participaciones.
- Gestión de actividades para organizadores.
- Moderación básica para administradores.
- Notificaciones de confirmación y cambios relevantes.

### Requisitos no funcionales

- Diseño responsive y accesible para dispositivos móviles y escritorio.
- Validación de datos en Backend; el Frontend no será la única barrera.
- Control de permisos por rol.
- Protección de datos personales y sesiones autenticadas.
- Paginación y filtros eficientes para el catálogo.
- Registro de errores y monitoreo para diagnosticar fallos.
- API versionada para facilitar cambios futuros.

## 3. Arquitectura seleccionada

Se selecciona una arquitectura de **monolito modular para el Backend +
aplicación web SPA para el Frontend**, comunicados mediante una **API REST
versionada**.

### Motivos de elección

- **Adecuada para el alcance inicial**: el curso requiere una base clara y
  mantenible, no la complejidad operativa de varios microservicios.
- **Separación de responsabilidades**: la interfaz, los casos de uso y el
  acceso a datos tienen límites explícitos.
- **Evolución gradual**: los módulos del Backend pueden extraerse a servicios
  independientes si el tráfico o los equipos lo justifican más adelante.
- **Despliegue simple**: inicialmente se pueden desplegar Backend y Frontend
  por separado sin administrar una malla de servicios.
- **Experiencia de usuario apropiada**: una SPA permite actualizar filtros,
  resultados e inscripciones sin recargar toda la página.
- **Integración flexible**: REST/JSON facilita conectar posteriormente una
  aplicación móvil, mapas, correo o notificaciones externas.
- **Pruebas y mantenimiento**: los módulos y capas reducen el acoplamiento y
  permiten probar reglas de negocio sin depender de la interfaz.

### Capas del Backend

1. **API/presentación**: rutas, controladores, serialización y autenticación
   HTTP.
2. **Aplicación**: casos de uso y orquestación de operaciones.
3. **Dominio**: entidades, reglas, políticas y contratos del negocio.
4. **Infraestructura**: base de datos, repositorios concretos, proveedores
   externos, correo y observabilidad.

La dependencia apunta hacia el dominio: las reglas de negocio no deben depender
de un framework, una base de datos o una pantalla concreta.

### Capas del Frontend

1. **Páginas y rutas**: composición de pantallas y navegación.
2. **Funcionalidades**: flujos orientados al usuario, como catálogo e
   inscripciones.
3. **Componentes compartidos**: controles visuales, layouts y utilidades.
4. **Servicios**: cliente HTTP, autenticación y manejo de estado remoto.

## 4. Estructura de carpetas

```text
ESP_PADISOF/
├── README.md
├── Backend/
│   ├── README.md
│   ├── src/
│   │   ├── api/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── tests/
│   └── docs/
└── Frontend/
    ├── README.md
    ├── src/
    │   ├── components/
    │   ├── features/
    │   ├── layouts/
    │   ├── pages/
    │   └── services/
    ├── public/
    ├── tests/
    └── docs/
```

Las carpetas se incluyen como puntos de extensión; permanecen sin código fuente
en esta entrega.

## 5. Límites y evolución

La primera versión debe priorizar descubrimiento, información confiable e
inscripción. No se asume inicialmente un sistema de pagos, recomendaciones con
inteligencia artificial ni microservicios. Esas capacidades pueden incorporarse
cuando existan métricas de uso, necesidades de escalabilidad y criterios de
seguridad que las justifiquen.

## 6. Próximos pasos

1. Acordar el contrato OpenAPI de la API.
2. Definir el modelo de datos para actividades, usuarios, roles e
   inscripciones.
3. Construir un prototipo de las pantallas de catálogo y detalle.
4. Implementar autenticación y autorización.
5. Validar el flujo con personas participantes y organizadores de Medellín.
6. Agregar pruebas automatizadas, observabilidad y despliegue.
