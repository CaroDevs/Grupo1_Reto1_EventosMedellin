import { Activity } from "@prisma/client";
import { ActivityService } from "./activity.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";

@Controller('activities')
export class ActivityController 
{
    constructor(private readonly activityService: ActivityService){}

    @Post() // <--- Define que este método responde a POST /activities
    create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
        return this.activityService.create(createActivityDto);
    }

    @Get() // <--- GET /activities
    findAll(): Promise<Activity[]> {
        return this.activityService.findAll();
    }

    @Get(':id') // <--- GET /activities/:id
    findOne(@Param('id') id: string): Promise<Activity | null> {
        return this.activityService.findOne(id);
    }
    
    @Put(':id') // <--- PUT /activities/:id
    update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto): Promise<Activity> {
        return this.activityService.update(id, updateActivityDto);
    }

    @Delete(':id') // <--- DELETE /activities/:id
    remove(@Param('id') id: string): Promise<Activity> {
        return this.activityService.remove(id);
    }
  
}