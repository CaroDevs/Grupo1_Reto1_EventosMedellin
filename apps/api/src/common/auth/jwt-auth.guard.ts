import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    // No confiamos en el rol que viene en el token: puede estar desactualizado
    // si a esta persona le cambiaron el rol después de que lo firmamos. Lo
    // releemos de la base de datos en cada petición, así un cambio de rol (o
    // un usuario borrado) se nota de inmediato, no hasta que el token expire.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('El usuario ya no existe');
    }

    request.user = { sub: user.id, role: user.role.name } satisfies JwtPayload;

    return true;
  }

  private extractToken(request: { headers: Record<string, string | undefined> }) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
