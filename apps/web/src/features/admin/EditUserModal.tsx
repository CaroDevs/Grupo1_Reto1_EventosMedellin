import { useState, type SubmitEvent } from 'react';
import { apiPatch } from '../../shared/http/client';
import type { User } from '../auth/User';
import { ROLE_NAMES, type RoleName } from '../../shared/auth/roles';

export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<RoleName>(user.role.name);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await apiPatch(`/users/${user.id}`, { name, email, role });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Editar usuario</h5>
                <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="edit-name">
                    Nombre
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={3}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="edit-email">
                    Email
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="edit-role">
                    Rol
                  </label>
                  <select
                    id="edit-role"
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleName)}
                  >
                    {ROLE_NAMES.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
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
