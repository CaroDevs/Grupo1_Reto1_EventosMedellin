import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: { select: { name: true } } },
    });

    const credentialsAreValid =
      user && (await bcrypt.compare(dto.password, user.password));

    if (!credentialsAreValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
