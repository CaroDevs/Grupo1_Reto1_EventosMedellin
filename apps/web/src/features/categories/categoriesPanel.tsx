import { useEffect, useState } from 'react';
import { apiDelete, apiGet } from '../../shared/http/client';
import type { Category } from './category';
import { EditCategoryModal } from './EditCategoryModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { ConfirmDeleteModal } from '../admin/ConfirmDeleteModal';

export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  async function loadCategories() {
    try {
      setCategories(await apiGet<Category[]>('/categories'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleConfirmDelete() {
    if (!deletingCategory) return;

    await apiDelete(`/categories/${deletingCategory.id}`);
    setDeletingCategory(null);
    await loadCategories();
  }

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
        No se pudo cargar la lista de categorías: {error}
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <button type="button" className="btn btn-success" onClick={() => setCreating(true)}>
          <i className="fa-solid fa-plus" /> Crear categoría
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setEditingCategory(category)}
                  >
                    <i className="fa-solid fa-pen" /> Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeletingCategory(category)}
                  >
                    <i className="fa-solid fa-trash" /> Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={() => {
            setEditingCategory(null);
            void loadCategories();
          }}
        />
      )}

      {creating && (
        <CreateCategoryModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            void loadCategories();
          }}
        />
      )}

      {deletingCategory && (
        <ConfirmDeleteModal
          name={deletingCategory.name}
          title="Borrar categoría"
          onCancel={() => setDeletingCategory(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </>
  );
}
