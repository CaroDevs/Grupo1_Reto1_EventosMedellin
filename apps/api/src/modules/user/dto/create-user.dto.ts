import {IsNotEmpty, IsString, IsEmail, IsIn, MinLength} from 'class-validator';

export class CreateUserDto {
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
    @IsIn(['admin', 'organizer', 'user'])
    role!: string;
}