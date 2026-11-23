import { PrismaService } from "../../database/prisma.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { IActivityBuilder } from "./Interfaces/activity.interface";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ActivityHelpers } from "./helpers/activityhelpers";
import { InvalidStateTransitionError } from "./domain/invalid.state.transition";
import { ActivityLocationPort, ActivityWithLocation } from "./adapter/activity.location.port";
import { ActivityBuilder } from "./builder/activity.builder";



@Injectable()
export class ActivityService
{
    constructor(
        private readonly prisma: PrismaService,
        private readonly locationPort: ActivityLocationPort,
    ){}

    private runTransition(action: () => void): void {
        try {
        action();
        } catch (error) {
        if (error instanceof InvalidStateTransitionError) {
            throw new ConflictException(error.message);
        }
        throw error;
        }
    }

    async create(createActivityDto: CreateActivityDto): Promise<ActivityWithLocation> {
        const builder: IActivityBuilder = ActivityBuilder.fromDto(createActivityDto);
        const activityData = builder.build();

        const activity = await this.prisma.activity.create({
        data: activityData,
        });

        await this.setLocation(
        activity.id,
        createActivityDto.latitude,
        createActivityDto.longitude,
        );

        return this.findOne(activity.id);
    }

    async findAll(filters: FilterActivitiesDto = {}): Promise<ActivityWithLocation[]> {
        const activities = await this.locationPort.findAll(filters);
        return Promise.all(
        activities.map((activity) =>
            ActivityHelpers.applyExpiration(activity, this.prisma),
        ),
        );
    }

    async findOne(id: string): Promise<ActivityWithLocation> {
        const activity = await this.locationPort.findById(id);
        if (!activity) {
        throw new NotFoundException(`Actividad con id ${id} no encontrada.`);
        }
        return ActivityHelpers.applyExpiration(activity, this.prisma);
    }

    async update(
        id: string,
        updateActivityDto: UpdateActivityDto,
    ): Promise<ActivityWithLocation> {
        const current = await this.findOne(id);
        const domain = ActivityHelpers.toActivityDomain(current);

        if (!domain.canEdit()) {
        throw new ConflictException(
            `No se puede editar una actividad en estado ${domain.status}.`,
        );
        }

        const { latitude, longitude, ...rest } = updateActivityDto;

        await this.prisma.activity.update({
        where: { id },
        data: rest,
        });

        await this.setLocation(id, latitude, longitude);

        return this.findOne(id);
    }

    async publish(id: string): Promise<ActivityWithLocation> {
        const current = await this.findOne(id);
        const domain = ActivityHelpers.toActivityDomain(current);

        this.runTransition(() => domain.publish());

        await this.prisma.activity.update({
        where: { id },
        data: { status: domain.status },
        });

        return this.findOne(id);
    }

    async cancel(id: string): Promise<ActivityWithLocation> {
        const current = await this.findOne(id);
        const domain = ActivityHelpers.toActivityDomain(current);

        this.runTransition(() => domain.cancel());

        await this.prisma.activity.update({
        where: { id },
        data: { status: domain.status },
        });

        return this.findOne(id);
    }

    async remove(id: string): Promise<ActivityWithLocation> {
        const current = await this.findOne(id);
        await this.prisma.activity.delete({ where: { id } });
        return current;
    }

    private async setLocation(
        id: string,
        latitude?: number,
        longitude?: number,
    ): Promise<void> {
        if (latitude === undefined || longitude === undefined) {
        return;
        }
        await this.locationPort.setCoordinates(id, latitude, longitude);
    }
}
