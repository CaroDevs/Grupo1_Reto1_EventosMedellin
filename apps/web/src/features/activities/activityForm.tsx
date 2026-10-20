import { useState, type FormEvent } from 'react';
import { apiPost } from '../../shared/http/client';

interface ActivitiesFormProps {
  onActivityCreated: () => void;
}

export function ActivityForm({ onActivityCreated }: Readonly<ActivitiesFormProps>) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('Medellín');
  const [price, setPrice] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(10);
  const [startDate, setStartDate] = useState('');

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
   event.preventDefault();
  
  console.log("1. ¡Se hizo clic y entró a handleSubmit!"); // <--- Añade esto
  console.log("Valores:", { title, category, city, price, capacity, startDate });

  if (!title.trim() || !category.trim()) {
    console.log("¡Faltan campos obligatorios (Título o Categoría)!");
    return;
  }

  try {
    console.log("2. Intentando enviar datos a la API...");
    const response = await apiPost('/activities', {
      title,
      description,
      category,
      city,
      price,
      capacity,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
    });
    
    console.log("3. ¡Guardado exitoso!", response);

    // Limpiar formulario
    setTitle('');
    setDescription('');
    setCategory('');
    setPrice(0);
    setCapacity(10);
    setStartDate('');

    onActivityCreated();
  } catch (err) {
    console.error('4. Error detallado en la petición:', err);
    alert('Hubo un error al conectar con el servidor. Revisa la consola.');
  }
  }

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="mb-3">Crear Nueva Actividad</h4>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Categoría</label>
          <input
            type="text"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej. Cultura, Deportes"
            required
          />
        </div>
        <div className="col-md-12">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Ciudad</label>
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
        <div className="col-12 text-end">
          <button type="submit" className="btn btn-primary">
            Guardar Actividad
          </button>
        </div>
      </form>
    </div>
  );
}