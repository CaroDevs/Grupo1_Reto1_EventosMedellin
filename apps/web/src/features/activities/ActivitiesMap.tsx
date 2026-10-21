import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { apiDelete, apiGet } from '../../shared/http/client';
import type { Activity } from './Activity';
import type { Category } from '../categories/category';
import { EditActivityModal } from './EditActivityModal';
import { ConfirmDeleteModal } from '../admin/ConfirmDeleteModal';
import { useSessionUser } from '../../shared/auth/session';
import { ADMIN_ROLE, ORGANIZER_ROLE } from '@medellin-activities/shared-types';
import { formatStartDate } from './formatActivityDate';

const TODAY = new Date().toISOString().slice(0, 10);

// Leaflet referencia sus íconos por defecto con rutas relativas que Vite no
// resuelve bien al empaquetar — hay que pisar las URLs con los assets ya
// importados (es el workaround estándar de react-leaflet + Vite/webpack).
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MEDELLIN_CENTER: [number, number] = [6.2442, -75.5812];

export function ActivitiesMap() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromFilter, setFromFilter] = useState(TODAY);
  const user = useSessionUser();
  const canManage = user?.role.name === ADMIN_ROLE || user?.role.name === ORGANIZER_ROLE;

  function loadActivities() {
    const params = new URLSearchParams();
    if (categoryFilter) params.set('category', categoryFilter);
    if (fromFilter) params.set('from', fromFilter);

    return apiGet<Activity[]>(`/activities?${params.toString()}`)
      .then(setActivities)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    apiGet<Category[]>('/categories')
      .then((result) =>
        setCategories([...result].sort((a, b) => a.name.localeCompare(b.name, 'es'))),
      )
      .catch((err: unknown) => console.error('No se pudieron cargar las categorías:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    void loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, fromFilter]);

  async function handleConfirmDelete() {
    if (!deletingActivity) return;

    await apiDelete(`/activities/${deletingActivity.id}`);
    setDeletingActivity(null);
    await loadActivities();
  }

  const located = activities.filter(
    (activity): activity is Activity & { latitude: number; longitude: number } =>
      activity.latitude != null && activity.longitude != null,
  );
  const withoutLocation = activities.length - located.length;

  return (
    <>
      <div className="row g-3 align-items-end mb-3">
        <div className="col-sm-6 col-md-4">
          <label className="form-label" htmlFor="activities-filter-category">
            Categoría
          </label>
          <select
            id="activities-filter-category"
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-6 col-md-4">
          <label className="form-label" htmlFor="activities-filter-from">
            Desde
          </label>
          <input
            id="activities-filter-from"
            type="date"
            className="form-control"
            value={fromFilter}
            min={TODAY}
            onChange={(e) => setFromFilter(e.target.value || TODAY)}
          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <output className="spinner-border text-primary">
            <span className="visually-hidden">Cargando...</span>
          </output>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          No se pudo conectar con la API: {error}
        </div>
      ) : (
        <>
          <div style={{ height: '70vh', width: '100%' }} className="rounded overflow-hidden shadow-sm">
            <MapContainer center={MEDELLIN_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {located.map((activity) => (
                <Marker key={activity.id} position={[activity.latitude, activity.longitude]}>
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <span className="badge text-bg-primary mb-2">{activity.category}</span>
                      <h6 className="mb-1">{activity.title}</h6>
                      <p className="mb-1 small">{activity.description}</p>
                      <p className="mb-1 small text-muted">
                        <i className="fa-solid fa-location-dot me-1" />
                        {activity.city}
                      </p>
                      {formatStartDate(activity.startDate) && (
                        <p className="mb-2 small text-muted">
                          <i className="fa-regular fa-calendar me-1" />
                          {formatStartDate(activity.startDate)}
                        </p>
                      )}
                      {canManage && (
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditingActivity(activity)}
                          >
                            <i className="fa-solid fa-pen" /> Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeletingActivity(activity)}
                          >
                            <i className="fa-solid fa-trash" /> Borrar
                          </button>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {activities.length === 0 && (
            <p className="text-muted mt-2 mb-0">No hay actividades que coincidan con el filtro.</p>
          )}

          {withoutLocation > 0 && (
            <p className="text-muted small mt-2 mb-0">
              {withoutLocation} actividad{withoutLocation === 1 ? '' : 'es'} sin ubicación — no
              {withoutLocation === 1 ? ' aparece' : ' aparecen'} en el mapa.
            </p>
          )}
        </>
      )}

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSaved={() => {
            setEditingActivity(null);
            void loadActivities();
          }}
        />
      )}

      {deletingActivity && (
        <ConfirmDeleteModal
          name={deletingActivity.title}
          title="Borrar actividad"
          onCancel={() => setDeletingActivity(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </>
  );
}
