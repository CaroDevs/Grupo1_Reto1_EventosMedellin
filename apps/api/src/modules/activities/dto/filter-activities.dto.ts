import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterActivitiesDto {
    @IsOptional()
    @IsString()
    category?: string;

    // Fecha desde la que buscar actividades (inclusive). Si no viene, el
    // service usa "ahora" por defecto — así nunca se muestran actividades
    // que ya pasaron.
    @IsOptional()
    @IsDateString()
    from?: string;
}
