import { useState } from 'react';
import { ActivitiesMap } from '../../features/activities/ActivitiesMap';
import { ActivityForm } from './activityForm';
import { useSessionUser } from "../../shared/auth/session";
import { ADMIN_ROLE, ORGANIZER_ROLE } from "@medellin-activities/shared-types";


export function ActivityPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useSessionUser();
  const canManage = user?.role.name === ADMIN_ROLE || user?.role.name === ORGANIZER_ROLE;
  const handleActivityCreated = () => {
    // Incrementa la llave para recargar la lista automáticamente al crear un evento
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container py-4">
      {
        canManage && (
          <>
            <h1 className="mb-4">Gestión de Actividades en Medellín</h1>
            {/* Formulario de creación conectado al patrón Builder en el backend */}
            <ActivityForm onActivityCreated={handleActivityCreated} />

            <hr className="my-4" />
          </>
        )
      }
      <h3 className="mb-3">Actividades Disponibles</h3>

      {/* Mapa con todas las actividades (PostGIS) */}
      <ActivitiesMap key={refreshKey} />
    </div>
  );
}
