import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!role) {
      throw new NotFoundException('El rol "user" no existe. ¿Corriste el seed?');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          roleId: role.id,
        },
      });

      const { password, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const { role, password, ...rest } = dto;
    let roleId: string | undefined;

    if (role) {
      const roleRecord = await this.prisma.role.findUnique({ where: { name: role } });
      if (!roleRecord) {
        throw new NotFoundException(`El rol "${role}" no existe`);
      }
      roleId = roleRecord.id;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(password && { password: await bcrypt.hash(password, 10) }),
        ...(roleId && { roleId }),
      },
      include: { role: { select: { name: true } } },
    });

    const { password: _hash, ...safeUser } = user;
    return safeUser;
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
