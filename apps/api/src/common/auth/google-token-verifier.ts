import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleTokenPayload {
  email?: string;
  name?: string;
}

export interface GoogleTokenVerifier {
  verify(idToken: string): Promise<GoogleTokenPayload | undefined>;
}

export const GOOGLE_TOKEN_VERIFIER = Symbol('GOOGLE_TOKEN_VERIFIER');

@Injectable()
export class GoogleTokenVerifierImpl implements GoogleTokenVerifier {
  private readonly client: OAuth2Client;
  private readonly clientId: string | undefined;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async verify(idToken: string): Promise<GoogleTokenPayload | undefined> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    });
    return ticket.getPayload();
  }
}
