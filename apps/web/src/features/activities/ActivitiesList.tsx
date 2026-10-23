import { useEffect, useState } from 'react';
import { apiGet } from '../../shared/http/client';
import type { Activity } from './Activity';
import { useActivityCrud } from './useActivityCrud';
import { useSessionUser } from '../../shared/auth/session';
import { ADMIN_ROLE, ORGANIZER_ROLE } from '@medellin-activities/shared-types';
import { formatStartDate } from './formatActivityDate';

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSessionUser();
  const canManage = user?.role.name === ADMIN_ROLE || user?.role.name === ORGANIZER_ROLE;

  function loadActivities() {
    return apiGet<Activity[]>('/activities')
      .then((result) =>
        setActivities(
          [...result].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? '')),
        ),
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const { setEditingActivity, setDeletingActivity, modals } = useActivityCrud(loadActivities);

  useEffect(() => {
    void loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <output className="spinner-border text-primary">
          <span className="visually-hidden">Cargando...</span>
        </output>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        No se pudo conectar con la API: {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return <p className="text-muted">No hay actividades registradas todavía.</p>;
  }

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {activities.map((activity) => (
          <div className="col" key={activity.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <span className="badge text-bg-primary mb-2">{activity.category}</span>
                <h5 className="card-title">{activity.title}</h5>
                <p className="card-text">{activity.description}</p>
                <p className="mb-1 small text-muted">
                  <i className="fa-solid fa-location-dot me-1" />
                  {activity.city}
                </p>
                {formatStartDate(activity.startDate) && (
                  <p className="mb-0 small text-muted">
                    <i className="fa-regular fa-calendar me-1" />
                    {formatStartDate(activity.startDate)}
                  </p>
                )}
              </div>
              {canManage && (
                <div className="card-footer bg-transparent d-flex justify-content-end gap-2">
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
          </div>
        ))}
      </div>

      {modals}
    </>
  );
}
