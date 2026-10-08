import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ROLE_NAMES, type RoleName } from '@medellin-activities/shared-types';

/**
 * Solo la usa un admin, desde una ruta protegida con RolesGuard(Admin).
 * A diferencia de CreateUserDto (registro público), esta sí permite
 * elegir el rol — es seguro porque quien la llama ya es admin.
 */
export class CreateUserByAdminDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(ROLE_NAMES)
  role!: RoleName;
}
