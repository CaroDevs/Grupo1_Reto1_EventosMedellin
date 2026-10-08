import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UserFactory } from '../../common/users/user.factory';
import { RegistrationStrategy } from '../../common/users/registration.strategy';
import { AdminCreationStrategy } from '../../common/users/admin-creation.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userFactory: UserFactory,
    private readonly registrationStrategy: RegistrationStrategy,
    private readonly adminCreationStrategy: AdminCreationStrategy,
  ) {}

  create(dto: CreateUserDto) {
    return this.userFactory.create(this.registrationStrategy, dto);
  }

  createByAdmin(dto: CreateUserByAdminDto) {
    return this.userFactory.create(this.adminCreationStrategy, dto);
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
