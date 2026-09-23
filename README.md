# Grupo1_Reto3_EventosMedellin
<img width="1405" height="161" alt="image" src="https://github.com/user-attachments/assets/fee271ef-feef-4fff-83cb-151b585a7ea9" />

# Arquitectura Monolito Modular
Para este proyecto elegimos un monolito modular porque el equipo de desarrollo es pequeño, el plazo es corto y front y back evolucionan juntos: casi cada funcionalidad (por ejemplo, un nuevo filtro de descubrimiento) toca ambos lados. Con un solo repositorio, ese cambio entra en un único pull request, con el contrato de la API (Open API) versionado junto al código que lo implementa y lo consume, lo que evita desincronizaciones entre capas.
Además, simplifica la configuración inicial, ya que hay un solo lugar para todo, si ambos lados usan el mismo lenguaje. Al mantener límites claros entre las apps, conservamos la posibilidad de separar servicios o desplegarlos de forma independiente cuando el proyecto crezca.
También tuvimos en cuenta la posibilidad de implementar la arquitectura hexagonal, para el desacoplamiento de dependencias, pero al tener en cuenta que esta misma arquitectura con una buena estructuración permite facilitar la evolución del sistema.
 



