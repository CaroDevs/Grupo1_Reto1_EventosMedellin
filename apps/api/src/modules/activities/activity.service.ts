import { Activity } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { IActivityBuilder } from "./Interfaces/activity.interface";
import { ActivityBuilder } from "./activity.builder";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";
import { Injectable } from "@nestjs/common";
import { ActivityLocationPort, ActivityWithLocation } from "./activity.location.port";

export type { ActivityWithLocation } from "./activity.location.port";

@Injectable()
export class ActivityService
{
    constructor(
        private readonly prisma: PrismaService,
        private readonly locationPort: ActivityLocationPort,
    ){}

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
 
    findAll(filters: FilterActivitiesDto = {}): Promise<ActivityWithLocation[]>
    {
        return this.locationPort.findAll(filters);
    }

    // Cuenta TODAS las actividades, sin el filtro de "solo futuras" que usa
    // findAll() — para el resumen del panel de admin importa el total real.
    count(): Promise<number>
    {
        return this.prisma.activity.count();
    }
 
    findOne(id: string): Promise<ActivityWithLocation | null>
    {
        return this.locationPort.findById(id);
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
        await this.locationPort.setCoordinates(id, latitude, longitude);
    }
}
