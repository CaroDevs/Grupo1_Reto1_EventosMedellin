import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_ROLE } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { BuiltUserData, UserCreationStrategy } from './user-creation-strategy';

export interface GoogleOAuthInput {
  email: string;
  name?: string | null;
}

/**
 * Primera vez que alguien entra con Google. Sin password (nunca
 * escribió una) — siempre rol User, igual que el registro normal.
 */
@Injectable()
export class GoogleOAuthStrategy implements UserCreationStrategy<GoogleOAuthInput> {
  constructor(private readonly prisma: PrismaService) {}

  async buildUserData(input: GoogleOAuthInput): Promise<BuiltUserData> {
    const role = await this.prisma.role.findUnique({ where: { name: DEFAULT_ROLE } });
    if (!role) {
      throw new NotFoundException(`El rol "${DEFAULT_ROLE}" no existe. ¿Corriste el seed?`);
    }

    return {
      name: input.name ?? input.email,
      email: input.email,
      password: null,
      roleId: role.id,
    };
  }
}
