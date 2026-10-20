import { useEffect, useState, type FormEvent } from 'react';
import { apiGet, apiPost } from '../../shared/http/client';
import type { Category } from '../categories/category';

interface ActivitiesFormProps {
  onActivityCreated: () => void;
}

export function ActivityForm({ onActivityCreated }: Readonly<ActivitiesFormProps>) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState('Medellín');
  const [price, setPrice] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(10);
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Category[]>('/categories')
      .then((result) =>
        setCategories([...result].sort((a, b) => a.name.localeCompare(b.name, 'es'))),
      )
      .catch((err: unknown) => console.error('No se pudieron cargar las categorías:', err));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !category.trim() || !city.trim()) {
      setError('Completa los campos obligatorios: título, descripción, categoría y ciudad.');
      return;
    }

    try {
      await apiPost('/activities', {
        title,
        description,
        category,
        city,
        price,
        capacity,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
      });

      setTitle('');
      setDescription('');
      setCategory('');
      setPrice(0);
      setCapacity(10);
      setStartDate('');

      onActivityCreated();
    } catch (err) {
      console.error('Error al guardar la actividad:', err);
      setError('Hubo un error al guardar la actividad. Intenta de nuevo.');
    }
  }

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="mb-3">Crear Nueva Actividad</h4>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">
            Título <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="activity-category">
            Categoría <span className="text-danger">*</span>
          </label>
          <select
            id="activity-category"
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
        <div className="col-md-12">
          <label className="form-label">
            Descripción <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">
            Ciudad <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Precio ($)</label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Capacidad</label>
          <input
            type="number"
            className="form-control"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            min={1}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fecha y Hora</label>
          <input
            type="datetime-local"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        {error && (
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        )}

        <div className="col-12 text-end">
          <button type="submit" className="btn btn-primary">
            Guardar Actividad
          </button>
        </div>
      </form>
    </div>
  );
}