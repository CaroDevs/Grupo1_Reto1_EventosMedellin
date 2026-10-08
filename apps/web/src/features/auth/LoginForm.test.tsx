import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginForm } from './LoginForm';
import { apiPost } from '../../shared/http/client';
import { getSessionUser } from '../../shared/auth/session';

vi.mock('../../shared/http/client', () => ({
  apiPost: vi.fn(),
}));

function renderLoginForm() {
  return render(
    <GoogleOAuthProvider clientId="fake-client-id-para-tests">
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/activities" element={<p>Página de actividades</p>} />
        </Routes>
      </MemoryRouter>
    </GoogleOAuthProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiPost).mockReset();
  });

  it('con credenciales correctas, guarda la sesión y navega a /activities', async () => {
    const user = userEvent.setup();
    vi.mocked(apiPost).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Alguien',
        email: 'alguien@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        role: { name: 'User' },
      },
      accessToken: 'token-123',
    });

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'alguien@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'contraseña123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(screen.getByText('Página de actividades')).toBeInTheDocument();
    });

    expect(getSessionUser()?.email).toBe('alguien@example.com');
    expect(apiPost).toHaveBeenCalledWith('/auth/login', {
      email: 'alguien@example.com',
      password: 'contraseña123',
    });
  });

  it('con credenciales incorrectas, muestra un error y no navega', async () => {
    const user = userEvent.setup();
    vi.mocked(apiPost).mockRejectedValue(new Error('Error 401 al consultar /auth/login'));

    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'alguien@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'contraseña-mala');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña incorrectos');
    expect(screen.queryByText('Página de actividades')).not.toBeInTheDocument();
    expect(getSessionUser()).toBeNull();
  });
});
