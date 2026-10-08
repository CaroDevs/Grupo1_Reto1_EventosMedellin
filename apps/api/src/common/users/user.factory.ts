import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { UserCreationStrategy } from './user-creation-strategy';

@Injectable()
export class UserFactory {
  constructor(private readonly prisma: PrismaService) {}

  async create<TInput>(strategy: UserCreationStrategy<TInput>, input: TInput) {
    const data = await strategy.buildUserData(input);

    try {
      const user = await this.prisma.user.create({
        data,
        include: { role: { select: { name: true } } },
      });

      const { password, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw error;
    }
  }
}
