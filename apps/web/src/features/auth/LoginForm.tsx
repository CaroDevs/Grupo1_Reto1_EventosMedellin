import { useState, type SubmitEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../../shared/http/client';
import { saveSession } from '../../shared/auth/session';
import type { User } from './User';

interface LoginResponse {
  user: User;
  accessToken: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, accessToken } = await apiPost<LoginResponse>('/auth/login', {
        email,
        password,
      });
      saveSession(user, accessToken);
      void navigate('/activities');
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '24rem' }}>
      <h2 className="mb-3">Iniciar sesión</h2>

      <div className="mb-3">
        <label className="form-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="mt-3 text-center">
        ¿No tienes cuenta? <Link to="/register">Crear una</Link>
      </p>
    </form>
  );
}
