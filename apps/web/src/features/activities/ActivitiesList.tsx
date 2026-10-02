import { useEffect, useState } from 'react';
import { apiGet } from '../../shared/http/client';
import type { Activity } from './Activity';

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Activity[]>('/activities')
      .then(setActivities)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
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
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {activities.map((activity) => (
        <div className="col" key={activity.id}>
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <span className="badge text-bg-primary mb-2">{activity.category}</span>
              <h5 className="card-title">{activity.title}</h5>
              <h6 className="card-subtitle mb-2 text-muted">{activity.city}</h6>
              <p className="card-text">{activity.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
