import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet referencia sus íconos por defecto con rutas relativas que Vite no
// resuelve bien al empaquetar — hay que pisar las URLs con los assets ya
// importados (es el workaround estándar de react-leaflet + Vite/webpack).
// Se importa este módulo (por su efecto secundario) en cualquier componente
// que vaya a dibujar un <Marker>, para no repetir el workaround.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
