import { useState, type SubmitEvent } from 'react';
import { apiPost } from '../../shared/http/client';
import { saveSessionUser } from '../../shared/auth/session';
import type { User } from './User';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await apiPost<User>('/users', { name, email, password });
      saveSessionUser(user);
      setRegisteredUser(user);
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

  if (registeredUser) {
    return <p>¡Cuenta creada! Bienvenido, {registeredUser.name}.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear cuenta</h2>

      <label>
        <span>Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          required
        />
      </label>

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
          minLength={8}
          required
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Registrarme'}
      </button>
    </form>
  );
}
