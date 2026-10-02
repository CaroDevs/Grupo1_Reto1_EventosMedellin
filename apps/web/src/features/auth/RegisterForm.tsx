import { useState, type SubmitEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../../shared/http/client';
import { saveSessionUser } from '../../shared/auth/session';
import type { User } from './User';

export function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await apiPost<User>('/users', { name, email, password });
      saveSessionUser(user);
      void navigate('/activities');
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('409')
          ? 'Ese email ya está registrado.'
          : 'No se pudo completar el registro. Revisa los datos e intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '24rem' }}>
      <h2 className="mb-3">Crear cuenta</h2>

      <div className="mb-3">
        <label className="form-label" htmlFor="register-name">
          Nombre
        </label>
        <input
          id="register-name"
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="register-email">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="register-password">
          Contraseña
        </label>
        <input
          id="register-password"
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

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Registrarme'}
      </button>

      <p className="mt-3 text-center">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}
