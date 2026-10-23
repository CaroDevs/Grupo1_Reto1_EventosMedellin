import { Activity } from "@prisma/client";
import { ActivityService } from "./activity.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/auth/roles.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { ADMIN_ROLE,ORGANIZER_ROLE } from "@medellin-activities/shared-types";


@Controller('activities')
export class ActivityController 
{
    constructor(private readonly activityService: ActivityService){}

    @Post() // <--- Define que este método responde a POST /activities
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
        return this.activityService.create(createActivityDto);
    }

    @Get() // <--- GET /activities
    findAll(@Query() filters: FilterActivitiesDto): Promise<Activity[]> {
        return this.activityService.findAll(filters);
    }

    @Get(':id') // <--- GET /activities/:id
    findOne(@Param('id') id: string): Promise<Activity | null> {
        return this.activityService.findOne(id);
    }
    
    @Put(':id') // <--- PUT /activities/:id
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto): Promise<Activity> {
        return this.activityService.update(id, updateActivityDto);
    }

    @Delete(':id') // <--- DELETE /activities/:id
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
    remove(@Param('id') id: string): Promise<Activity> {
        return this.activityService.remove(id);
    }
  
}