import { Activity } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { IActivityBuilder } from "./Interfaces/activity.interface";
import { ActivityBuilder } from "./activity.builder";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";
import { Injectable } from "@nestjs/common";

// location es una columna PostGIS (geography(Point,4326)) — Prisma Client no
// puede leerla/escribirla directo (por eso es Unsupported en schema.prisma).
// La leemos con ST_X/ST_Y vía SQL crudo y la exponemos como latitude/longitude
// planos, que es lo que el frontend necesita para dibujar el mapa.
export type ActivityWithLocation = Activity & {
    latitude: number | null;
    longitude: number | null;
};

const SELECT_WITH_LOCATION = `
    SELECT
        id, title, description, category, city, price, capacity,
        "startDate", "createdAt", "updatedAt",
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
    FROM activities
`;

@Injectable()
export class ActivityService
{
    constructor(private readonly prisma: PrismaService){}

    async create(createActivityDto: CreateActivityDto): Promise<ActivityWithLocation>
    {
        const builder: IActivityBuilder = ActivityBuilder.fromDto(createActivityDto);
        const activityData = builder.build();

        const activity = await this.prisma.activity.create({
            data: activityData,
        });

        await this.setLocation(activity.id, createActivityDto.latitude, createActivityDto.longitude);

        return (await this.findOne(activity.id))!;
    }

    async findAll(filters: FilterActivitiesDto = {}): Promise<ActivityWithLocation[]>
    {
        // Solo actividades con fecha futura (o igual a "from", si lo mandan) —
        // sin fecha no hay forma de saber si ya pasaron, así que se excluyen.
        const conditions: string[] = [`"startDate" IS NOT NULL`, `"startDate"::timestamptz >= $1`];
        const params: unknown[] = [filters.from ?? new Date().toISOString()];

        if (filters.category) {
            params.push(filters.category);
            conditions.push(`category = $${params.length}`);
        }

        return this.prisma.$queryRawUnsafe<ActivityWithLocation[]>(
            `${SELECT_WITH_LOCATION} WHERE ${conditions.join(' AND ')} ORDER BY "startDate" ASC`,
            ...params,
        );
    }

    // Cuenta TODAS las actividades, sin el filtro de "solo futuras" que usa
    // findAll() — para el resumen del panel de admin importa el total real.
    count(): Promise<number>
    {
        return this.prisma.activity.count();
    }

    async findOne(id: string): Promise<ActivityWithLocation | null>
    {
        const rows = await this.prisma.$queryRawUnsafe<ActivityWithLocation[]>(
            `${SELECT_WITH_LOCATION} WHERE id = $1`,
            id,
        );
        return rows[0] ?? null;
    }

    async update(id: string, updateActivityDto: UpdateActivityDto): Promise<ActivityWithLocation>
    {
        const { latitude, longitude, ...rest } = updateActivityDto;

        await this.prisma.activity.update({
            where: {id},
            data: rest,
        });

        await this.setLocation(id, latitude, longitude);

        return (await this.findOne(id))!;
    }

    async remove(id: string): Promise<Activity>
    {
        return this.prisma.activity.delete({where: {id}});
    }

    private async setLocation(id: string, latitude?: number, longitude?: number): Promise<void>
    {
        if (latitude === undefined || longitude === undefined) {
            return;
        }

        await this.prisma.$executeRawUnsafe(
            `UPDATE activities
             SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
             WHERE id = $3`,
            longitude,
            latitude,
            id,
        );
    }
}
