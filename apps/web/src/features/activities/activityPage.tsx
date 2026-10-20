import { useState } from 'react';
import { ActivitiesList } from '../../features/activities/ActivitiesList';
import { ActivityForm } from './activityForm';

export function ActivityPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActivityCreated = () => {
    // Incrementa la llave para recargar la lista automáticamente al crear un evento
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Gestión de Actividades en Medellín</h1>
      
      {/* Formulario de creación conectado al patrón Builder en el backend */}
      <ActivityForm onActivityCreated={handleActivityCreated} />
      
      <hr className="my-4" />
      
      <h3 className="mb-3">Actividades Disponibles</h3>
      
      {/* Lista de actividades */}
      <ActivitiesList key={refreshKey} />
    </div>
  );
}