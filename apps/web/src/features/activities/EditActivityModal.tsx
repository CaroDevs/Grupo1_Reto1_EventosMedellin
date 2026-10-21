import { useState, type FormEvent } from 'react';
import { apiPut } from '../../shared/http/client';
import type { Activity } from './Activity';
import { useCategories } from '../categories/useCategories';

export function EditActivityModal({
  activity,
  onClose,
  onSaved,
}: {
  activity: Activity;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [category, setCategory] = useState(activity.category);
  const categories = useCategories();
  const [city, setCity] = useState(activity.city);
  const [price, setPrice] = useState<number>(activity.price ?? 0);
  const [capacity, setCapacity] = useState<number>(activity.capacity ?? 10);
  const [startDate, setStartDate] = useState(
    activity.startDate ? activity.startDate.slice(0, 16) : '',
  );
  const [latitude, setLatitude] = useState(
    activity.latitude != null ? String(activity.latitude) : '',
  );
  const [longitude, setLongitude] = useState(
    activity.longitude != null ? String(activity.longitude) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await apiPut(`/activities/${activity.id}`, {
        title,
        description,
        category,
        city,
        price,
        capacity,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      });
      onSaved();
    } catch (err) {
      console.error('Error al guardar la actividad:', err);
      setError('No se pudo guardar el cambio. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Editar actividad</h5>
                <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
              </div>

              <div className="modal-body row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-activity-title">
                    Título
                  </label>
                  <input
                    id="edit-activity-title"
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-activity-category">
                    Categoría
                  </label>
                  <select
                    id="edit-activity-category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {categories.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="edit-activity-description">
                    Descripción
                  </label>
                  <textarea
                    id="edit-activity-description"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="edit-activity-city">
                    Ciudad
                  </label>
                  <input
                    id="edit-activity-city"
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="edit-activity-price">
                    Precio ($)
                  </label>
                  <input
                    id="edit-activity-price"
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="edit-activity-capacity">
                    Capacidad
                  </label>
                  <input
                    id="edit-activity-capacity"
                    type="number"
                    className="form-control"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="edit-activity-date">
                    Fecha y Hora
                  </label>
                  <input
                    id="edit-activity-date"
                    type="datetime-local"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-activity-latitude">
                    Latitud
                  </label>
                  <input
                    id="edit-activity-latitude"
                    type="number"
                    step="any"
                    className="form-control"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ej. 6.2442"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="edit-activity-longitude">
                    Longitud
                  </label>
                  <input
                    id="edit-activity-longitude"
                    type="number"
                    step="any"
                    className="form-control"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ej. -75.5812"
                  />
                </div>

                {error && (
                  <div className="col-12">
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
