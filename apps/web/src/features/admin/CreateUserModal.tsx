import { useState, type SubmitEvent } from 'react';
import { apiPost } from '../../shared/http/client';
import type { User } from '../auth/User';

export function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await apiPost<User>('/users', { name, email, password });
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('409')
          ? 'Ese email ya está registrado.'
          : 'No se pudo crear el usuario. Revisa los datos e intenta de nuevo.',
      );
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
                <h5 className="modal-title">Crear usuario</h5>
                <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
              </div>

              <div className="modal-body">
                <p className="text-muted small">
                  Se crea con rol <strong>User</strong>. Si necesitas otro rol, edítalo después
                  de crearlo.
                </p>

                <div className="mb-3">
                  <label className="form-label" htmlFor="create-name">
                    Nombre
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={3}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="create-email">
                    Email
                  </label>
                  <input
                    id="create-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="create-password">
                    Contraseña
                  </label>
                  <input
                    id="create-password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
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
                  {saving ? 'Creando...' : 'Crear usuario'}
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
