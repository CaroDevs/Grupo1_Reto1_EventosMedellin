import { useEffect, useState, type SubmitEvent } from 'react';
import { apiDelete, apiGet, apiPost } from '../../shared/http/client';
import { Category } from './category';


export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');

  async function loadCategories() {
    setCategories(await apiGet<Category[]>('/categories'));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    await apiPost('/categories', { name });
    setName('');
    await loadCategories();
  }

  async function handleDelete(id: string) {
    await apiDelete(`/categories/${id}`);
    await loadCategories();
  }

  return (
    <section>
      <h2>Categorías</h2>
      <form onSubmit={handleCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nueva categoría" />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <button onClick={() => handleDelete(category.id)}>Borrar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}