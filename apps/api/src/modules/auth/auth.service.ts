import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { UserFactory } from '../../common/users/user.factory';
import { GoogleOAuthStrategy } from '../../common/users/google-oauth.strategy';
import {
  GOOGLE_TOKEN_VERIFIER,
  type GoogleTokenVerifier,
} from '../../common/auth/google-token-verifier';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userFactory: UserFactory,
    private readonly googleOAuthStrategy: GoogleOAuthStrategy,
    @Inject(GOOGLE_TOKEN_VERIFIER)
    private readonly googleTokenVerifier: GoogleTokenVerifier,
  ) {}

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
      payload = await this.googleTokenVerifier.verify(dto.idToken);
    } catch {
      throw new UnauthorizedException('Token de Google inválido');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Token de Google inválido');
    }

    const email = payload.email;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } },
    });

    // Si ya existe, solo quitamos el password de la respuesta. Si es la
    // primera vez, UserFactory + GoogleOAuthStrategy arman el usuario
    // nuevo (sin password, rol User) — es la misma pieza que usa el
    // registro normal y la creación desde el panel de admin, solo
    // cambia la estrategia.
    let safeUser;
    if (existingUser) {
      const { password, ...rest } = existingUser;
      safeUser = rest;
    } else {
      safeUser = await this.userFactory.create(this.googleOAuthStrategy, {
        email,
        name: payload.name,
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: safeUser.id,
      role: safeUser.role.name,
    });

    return { user: safeUser, accessToken };
  }
}
