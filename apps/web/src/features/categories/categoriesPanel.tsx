import { useEffect, useState, type SubmitEvent } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../shared/http/client';
import { Category } from './category';


export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  async function loadCategories() {
    setCategories(await apiGet<Category[]>('/categories'));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !description.trim()) return;
    await apiPost('/categories', { name, description });
    setName('');
    setDescription('');
    await loadCategories();
  }

  async function handleDelete(id: string) {
    await apiDelete(`/categories/${id}`);
    await loadCategories();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    if (!editName.trim() || !editDescription.trim()) return;
    await apiPatch(`/categories/${id}`, { name: editName, description: editDescription });
    setEditingId(null);
    await loadCategories();
  }

  return (
    <section>
      <h2>Categorías</h2>
      <form onSubmit={handleCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
        />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {categories.map((category) =>
          editingId === category.id ? (
            <li key={category.id}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              <button onClick={() => void saveEdit(category.id)}>Guardar</button>
              <button onClick={cancelEdit}>Cancelar</button>
            </li>
          ) : (
            <li key={category.id}>
              {category.name} — {category.description}
              <button onClick={() => startEdit(category)}>Editar</button>
              <button onClick={() => handleDelete(category.id)}>Borrar</button>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
