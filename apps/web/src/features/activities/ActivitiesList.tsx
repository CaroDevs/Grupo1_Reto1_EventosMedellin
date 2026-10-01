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

  if (loading) return <p>Cargando actividades...</p>;
  if (error) return <p>No se pudo conectar con la API: {error}</p>;
  if (activities.length === 0) return <p>No hay actividades registradas todavía.</p>;

  return (
    <ul>
      {activities.map((activity) => (
        <li key={activity.id}>
          <strong>{activity.title}</strong> — {activity.category} ({activity.city})
          <p>{activity.description}</p>
        </li>
      ))}
    </ul>
  );
}
