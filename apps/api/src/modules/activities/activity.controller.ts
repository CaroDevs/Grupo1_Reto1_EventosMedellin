import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../common/auth/optional-jwt-auth.guard";
import type { JwtPayload } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/auth/roles.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { ADMIN_ROLE,ORGANIZER_ROLE } from "@medellin-activities/shared-types";
import { ActivityService } from "./activity.service";
import { ActivityWithLocation } from "./adapter/activity.location.port";


@Controller('activities')
export class ActivityController 
{
    constructor(private readonly activityService: ActivityService){}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    create(@Body() createActivityDto: CreateActivityDto,): Promise<ActivityWithLocation> {
        return this.activityService.create(createActivityDto);
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    findAll(
        @Query() filters: FilterActivitiesDto,
        @Req() req: { user?: JwtPayload },
    ): Promise<ActivityWithLocation[]> {
        return this.activityService.findAll(filters, req.user);
    }

    @Get(":id")
    @UseGuards(OptionalJwtAuthGuard)
    findOne(
        @Param("id") id: string,
        @Req() req: { user?: JwtPayload },
    ): Promise<ActivityWithLocation> {
        return this.activityService.findOne(id, req.user);
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    update(@Param("id") id: string,@Body() updateActivityDto: UpdateActivityDto,): Promise<ActivityWithLocation> {
        return this.activityService.update(id, updateActivityDto);
    }

    @Patch(":id/publish")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    publish(@Param("id") id: string): Promise<ActivityWithLocation> {
        return this.activityService.publish(id);
    }

    @Patch(":id/cancel")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    cancel(@Param("id") id: string): Promise<ActivityWithLocation> {
        return this.activityService.cancel(id);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    remove(@Param("id") id: string): Promise<ActivityWithLocation> {
        return this.activityService.remove(id);
    }
  
}