import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DEFAULT_ROLE } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { UserCreationTemplate } from './user-creation.template';

export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Registro público (POST /users). Siempre entra con rol User — nadie se
 * auto-asigna un rol distinto desde este camino.
 */
@Injectable()
export class RegistrationStrategy extends UserCreationTemplate<RegistrationInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected resolveRoleId(): Promise<string> {
    return this.findRoleIdByName(DEFAULT_ROLE);
  }

  protected resolvePassword(input: RegistrationInput): Promise<string> {
    return bcrypt.hash(input.password, 10);
  }

  protected resolveName(input: RegistrationInput): string {
    return input.name;
  }

  protected resolveEmail(input: RegistrationInput): string {
    return input.email;
  }
}
