import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ROLE_NAMES, type RoleName } from '@medellin-activities/shared-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @IsIn(ROLE_NAMES)
  role?: RoleName;
}
