import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class DeleteUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;
}