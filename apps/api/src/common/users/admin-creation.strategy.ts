import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { RoleName } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { BuiltUserData, UserCreationStrategy } from './user-creation-strategy';

export interface AdminCreationInput {
  name: string;
  email: string;
  password: string;
  role: RoleName;
}

/**
 * Un admin crea un usuario desde el panel, eligiendo el rol directo.
 * Esto NUNCA debe quedar accesible por la ruta pública de registro —
 * el controller que use esta estrategia tiene que estar protegido con
 * JwtAuthGuard + RolesGuard(Admin).
 */
@Injectable()
export class AdminCreationStrategy implements UserCreationStrategy<AdminCreationInput> {
  constructor(private readonly prisma: PrismaService) {}

  async buildUserData(input: AdminCreationInput): Promise<BuiltUserData> {
    const role = await this.prisma.role.findUnique({ where: { name: input.role } });
    if (!role) {
      throw new NotFoundException(`El rol "${input.role}" no existe`);
    }

    return {
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      roleId: role.id,
    };
  }
}
