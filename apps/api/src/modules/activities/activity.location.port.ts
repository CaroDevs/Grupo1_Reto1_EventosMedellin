import { Activity } from "@prisma/client";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";

// location es una columna PostGIS (geography(Point,4326)) — Prisma Client no
// puede leerla/escribirla directo (por eso es Unsupported en schema.prisma).
// La leemos con ST_X/ST_Y vía SQL crudo y la exponemos como latitude/longitude
// planos, que es lo que el frontend necesita para dibujar el mapa.
export type ActivityWithLocation = Activity & {
    latitude: number | null;
    longitude: number | null;
};

export abstract class ActivityLocationPort
{
    abstract findAll(filters: FilterActivitiesDto): Promise<ActivityWithLocation[]>;
    abstract findById(id: string): Promise<ActivityWithLocation | null>;
    abstract setCoordinates(id: string, latitude: number, longitude: number): Promise<void>;
}