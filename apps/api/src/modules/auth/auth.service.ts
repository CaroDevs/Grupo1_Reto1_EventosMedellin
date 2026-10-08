import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { DEFAULT_ROLE } from '@medellin-activities/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: { select: { name: true } } },
    });

    // user.password puede ser null (cuentas creadas por Google) — en ese
    // caso nunca es "válido" comparar, pero el mensaje de error es el
    // mismo que cualquier otro fallo, para no revelar que esa cuenta
    // existe y entra solo por Google.
    const credentialsAreValid =
      user?.password && (await bcrypt.compare(dto.password, user.password));

    if (!credentialsAreValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const { password, ...safeUser } = user;
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role.name,
    });

    return { user: safeUser, accessToken };
  }

  async loginWithGoogle(dto: GoogleLoginDto) {
    let payload: { email?: string; name?: string } | undefined;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Token de Google inválido');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Token de Google inválido');
    }

    const email = payload.email;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      const role = await this.prisma.role.findUnique({ where: { name: DEFAULT_ROLE } });
      if (!role) {
        throw new NotFoundException(`El rol "${DEFAULT_ROLE}" no existe. ¿Corriste el seed?`);
      }

      user = await this.prisma.user.create({
        data: {
          name: payload.name ?? email,
          email,
          roleId: role.id,
          // password queda null — esta cuenta solo entra por Google.
        },
        include: { role: { select: { name: true } } },
      });
    }

    const { password, ...safeUser } = user;
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role.name,
    });

    return { user: safeUser, accessToken };
  }
}
