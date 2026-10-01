import { useState, type SubmitEvent } from 'react';
import { apiPost } from '../../shared/http/client';
import { saveSessionUser } from '../../shared/auth/session';
import type { User } from './User';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await apiPost<User>('/auth/login', { email, password });
      saveSessionUser(user);
      setLoggedInUser(user);
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  if (loggedInUser) {
    return <p>Sesión iniciada como {loggedInUser.name} ({loggedInUser.role.name}).</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>

      <label>
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        <span>Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
