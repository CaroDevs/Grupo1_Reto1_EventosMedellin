import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { BuiltUserData, UserCreationStrategy } from './user-creation-strategy';

/**
 * Template Method: Registration, GoogleOAuth y AdminCreation resuelven el
 * mismo esqueleto de pasos (rol -> password -> nombre -> email), solo que
 * cada una decide distinto CÓMO resolver cada paso. buildUserData() es el
 * método plantilla — fijo, ninguna subclase lo toca — y las subclases solo
 * implementan los pasos abstractos.
 */
export abstract class UserCreationTemplate<TInput> implements UserCreationStrategy<TInput> {
  constructor(protected readonly prisma: PrismaService) {}

  async buildUserData(input: TInput): Promise<BuiltUserData> {
    const roleId = await this.resolveRoleId(input);
    const password = await this.resolvePassword(input);

    return {
      name: this.resolveName(input),
      email: this.resolveEmail(input),
      password,
      roleId,
    };
  }

  protected abstract resolveRoleId(input: TInput): Promise<string>;
  protected abstract resolvePassword(input: TInput): Promise<string | null>;
  protected abstract resolveName(input: TInput): string;
  protected abstract resolveEmail(input: TInput): string;

  // Paso compartido real (no abstracto): las 3 estrategias buscan un rol por
  // nombre de la misma forma — lo que varía es QUÉ nombre buscan, y eso sí
  // lo decide cada resolveRoleId().
  protected async findRoleIdByName(roleName: string): Promise<string> {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException(`El rol "${roleName}" no existe. ¿Corriste el seed?`);
    }
    return role.id;
  }
}
