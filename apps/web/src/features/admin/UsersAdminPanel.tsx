import { useEffect, useState } from 'react';
import { apiDelete, apiGet } from '../../shared/http/client';
import type { User } from '../auth/User';
import { EditUserModal } from './EditUserModal';

export function UsersAdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  async function loadUsers() {
    try {
      setUsers(await apiGet<User[]>('/users'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`¿Borrar a "${name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    await apiDelete(`/users/${id}`);
    await loadUsers();
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
        No se pudo cargar la lista de usuarios: {error}
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge text-bg-success">{user.role.name}</span>
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setEditingUser(user)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(user.id, user.name)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            void loadUsers();
          }}
        />
      )}
    </>
  );
}
