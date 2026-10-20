import { Activity } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { IActivityBuilder } from "./Interfaces/activity.interface";
import { ActivityBuilder } from "./activity.builder";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ActivityService
{
    constructor(private readonly prisma: PrismaService){}

    async create(createActivityDto: CreateActivityDto): Promise<Activity>
    {
        const builder: IActivityBuilder = ActivityBuilder.fromDto(createActivityDto);
        const activityData = builder.build();

        return this.prisma.activity.create(
            {
                data: activityData,
            }
        );
    }

    async findAll(): Promise<Activity[]>
    {
        return this.prisma.activity.findMany({
            orderBy: {createdAt: 'desc'},
        });
    }

    async findOne(id: string): Promise<Activity | null>
    {
        return this.prisma.activity.findUnique({ where: {id}});
    }

    async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity>
    {
        return this.prisma.activity.update({
            where: {id},
            data: updateActivityDto,
        });
    }

    async remove(id: string): Promise<Activity>
    {
        return this.prisma.activity.delete({where: {id}});
    }

   
}