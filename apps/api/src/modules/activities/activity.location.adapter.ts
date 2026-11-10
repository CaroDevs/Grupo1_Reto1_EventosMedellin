import { Injectable } from "@nestjs/common";
import { ActivityLocationPort, ActivityWithLocation } from "./activity.location.port";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";
import { PrismaService } from "../../database/prisma.service";


const SELECT_WITH_LOCATION = `
    SELECT
        id, title, description, category, city, price, capacity,
        "startDate", "createdAt", "updatedAt",
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
    FROM activities
`;

@Injectable()
export class ActivityLocationAdapter implements ActivityLocationPort
{
    constructor(private readonly prisma: PrismaService){}

    async findAll(filters: FilterActivitiesDto = {}): Promise<ActivityWithLocation[]> {
        const conditions: string[] = [`"startDate" IS NOT NULL`, `"startDate"::timestamptz >= $1`];
        const params: unknown[] = [filters.from ?? new Date(). toISOString()];

        if(filters.category)
        {
            params.push(filters.category)
            conditions.push(`category = $${params.length}`);
        }

        return this.prisma.$queryRawUnsafe<ActivityWithLocation[]>(
            `${SELECT_WITH_LOCATION} WHERE ${conditions.join(' AND ')} ORDER BY "startDate" ASC`,
            ...params,
        );
        
        
    }
    async findById(id: string): Promise<ActivityWithLocation | null> {
        const rows = await this.prisma.$queryRawUnsafe<ActivityWithLocation[]>(
            `${SELECT_WITH_LOCATION} WHERE id = $1`,
            id,
        );
        return rows[0] ?? null;
    }
    async setCoordinates(id: string, latitude: number, longitude: number): Promise<void> {
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