import {IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsLatitude, IsLongitude} from 'class-validator';

export class CreateActivityDto{
    @IsString()
    @IsNotEmpty()
    title!: string; // validamos con el ! que la propiedad estará definida

    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsString()
    @IsNotEmpty()
    city!: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    capacity?: number;

    @IsString()
    @IsOptional()
    startDate?: string;

    @IsLatitude()
    @IsOptional()
    latitude?: number;

    @IsLongitude()
    @IsOptional()
    longitude?: number;

}