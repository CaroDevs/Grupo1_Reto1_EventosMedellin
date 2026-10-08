import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../shared/http/client';
import { saveSession } from '../../shared/auth/session';
import type { User } from './User';

interface GoogleLoginResponse {
  user: User;
  accessToken: string;
}

export function GoogleLoginButton({ onError }: { onError: (message: string) => void }) {
  const navigate = useNavigate();

  async function handleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      onError('No se pudo completar el login con Google.');
      return;
    }

    try {
      const { user, accessToken } = await apiPost<GoogleLoginResponse>('/auth/google', {
        idToken: credentialResponse.credential,
      });
      saveSession(user, accessToken);
      void navigate('/activities');
    } catch {
      onError('No se pudo completar el login con Google.');
    }
  }

  return (
    <GoogleLogin onSuccess={handleSuccess} onError={() => onError('No se pudo completar el login con Google.')} />
  );
}
