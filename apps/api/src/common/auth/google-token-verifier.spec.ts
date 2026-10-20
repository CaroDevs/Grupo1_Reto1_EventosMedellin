import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleTokenVerifierImpl } from './google-token-verifier';

describe('GoogleTokenVerifierImpl', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createVerifier() {
    const config = { get: jest.fn().mockReturnValue('fake-client-id') } as unknown as ConfigService;
    return new GoogleTokenVerifierImpl(config);
  }

  it('devuelve el payload del token verificado', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ email: 'alguien@example.com', name: 'Alguien' }),
    } as never);

    const verifier = createVerifier();
    const payload = await verifier.verify('token-de-google');

    expect(payload).toEqual({ email: 'alguien@example.com', name: 'Alguien' });
  });

  it('propaga el error si el token no es válido', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValue(new Error('inválido'));

    const verifier = createVerifier();

    await expect(verifier.verify('token-roto')).rejects.toThrow('inválido');
  });
});
