import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserByAdminDto } from "./dto/create-user-by-admin.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/auth/roles.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { ADMIN_ROLE } from "@medellin-activities/shared-types";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  createByAdmin(@Body() dto: CreateUserByAdminDto) {
    return this.userService.createByAdmin(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
