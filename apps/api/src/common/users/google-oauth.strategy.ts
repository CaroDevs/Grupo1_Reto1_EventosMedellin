import { Injectable } from '@nestjs/common';
import { DEFAULT_ROLE } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { UserCreationTemplate } from './user-creation.template';

export interface GoogleOAuthInput {
  email: string;
  name?: string | null;
}

/**
 * Primera vez que alguien entra con Google. Sin password (nunca
 * escribió una) — siempre rol User, igual que el registro normal.
 */
@Injectable()
export class GoogleOAuthStrategy extends UserCreationTemplate<GoogleOAuthInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected resolveRoleId(): Promise<string> {
    return this.findRoleIdByName(DEFAULT_ROLE);
  }

  protected resolvePassword(): Promise<null> {
    return Promise.resolve(null);
  }

  protected resolveName(input: GoogleOAuthInput): string {
    return input.name ?? input.email;
  }

  protected resolveEmail(input: GoogleOAuthInput): string {
    return input.email;
  }
}
