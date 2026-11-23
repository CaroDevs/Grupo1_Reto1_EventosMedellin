import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import type { JwtPayload } from './jwt-auth.guard';

// Igual que JwtAuthGuard, pero NUNCA rechaza: si hay un token válido deja
// `request.user` listo; si no hay token, es inválido, venció o el usuario ya
// no existe, la petición pasa como anónima (sin `request.user`).
// Sirve para rutas públicas que muestran más cosas a quien gestiona.
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Igual que en JwtAuthGuard: el rol se relee de la base de datos.
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: { select: { name: true } } },
      });

      if (user) {
        request.user = { sub: user.id, role: user.role.name } satisfies JwtPayload;
      }
    } catch {
      // Token inválido o vencido: se trata como anónimo.
    }

    return true;
  }

  private extractToken(request: { headers: Record<string, string | undefined> }) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
