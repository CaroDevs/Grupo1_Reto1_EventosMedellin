import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { RoleName } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { UserCreationTemplate } from './user-creation.template';

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
export class AdminCreationStrategy extends UserCreationTemplate<AdminCreationInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected resolveRoleId(input: AdminCreationInput): Promise<string> {
    return this.findRoleIdByName(input.role);
  }

  protected resolvePassword(input: AdminCreationInput): Promise<string> {
    return bcrypt.hash(input.password, 10);
  }

  protected resolveName(input: AdminCreationInput): string {
    return input.name;
  }

  protected resolveEmail(input: AdminCreationInput): string {
    return input.email;
  }
}
