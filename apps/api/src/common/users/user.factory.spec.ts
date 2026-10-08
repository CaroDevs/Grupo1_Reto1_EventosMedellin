import { describe, expect, it, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserFactory } from './user.factory';
import { PrismaService } from '../../database/prisma.service';
import type { BuiltUserData, UserCreationStrategy } from './user-creation-strategy';

function fakeStrategy(data: BuiltUserData): UserCreationStrategy<unknown> {
  return { buildUserData: jest.fn().mockResolvedValue(data) as never };
}

describe('UserFactory', () => {
  it('le pide los datos a la estrategia y los inserta, sin devolver el password', async () => {
    const builtData: BuiltUserData = {
      name: 'Alguien',
      email: 'alguien@example.com',
      password: 'hash-123',
      roleId: 'role-user',
    };

    const prisma = {
      user: {
        create: jest.fn().mockResolvedValue({
          id: 'user-1',
          ...builtData,
          createdAt: new Date(),
          role: { name: 'User' },
        }),
      },
    } as unknown as PrismaService;

    const factory = new UserFactory(prisma);
    const strategy = fakeStrategy(builtData);

    const result = await factory.create(strategy, { da: 'igual, lo decide la estrategia' });

    expect(strategy.buildUserData).toHaveBeenCalled();
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: builtData,
      include: { role: { select: { name: true } } },
    });
    expect(result).not.toHaveProperty('password');
  });

  it('traduce el email duplicado (P2002) a ConflictException', async () => {
    const prisma = {
      user: {
        create: jest.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'test',
          }),
        ),
      },
    } as unknown as PrismaService;

    const factory = new UserFactory(prisma);
    const strategy = fakeStrategy({
      name: 'Alguien',
      email: 'repetido@example.com',
      password: null,
      roleId: 'role-user',
    });

    await expect(factory.create(strategy, {})).rejects.toThrow(ConflictException);
  });
});
