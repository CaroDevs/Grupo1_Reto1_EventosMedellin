import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DEFAULT_ROLE } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { BuiltUserData, UserCreationStrategy } from './user-creation-strategy';

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
export class RegistrationStrategy implements UserCreationStrategy<RegistrationInput> {
  constructor(private readonly prisma: PrismaService) {}

  async buildUserData(input: RegistrationInput): Promise<BuiltUserData> {
    const role = await this.prisma.role.findUnique({ where: { name: DEFAULT_ROLE } });
    if (!role) {
      throw new NotFoundException(`El rol "${DEFAULT_ROLE}" no existe. ¿Corriste el seed?`);
    }

    return {
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      roleId: role.id,
    };
  }
}
