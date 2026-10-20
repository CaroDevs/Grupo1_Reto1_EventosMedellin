import { Activity } from "@prisma/client";
import { ActivityService } from "./activity.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

export class ActivityController 
{
    constructor(private readonly activityService: ActivityService){}

    
    create(createActivityDto: CreateActivityDto): Promise<Activity> 
    {
        return this.activityService.create(createActivityDto);
    }

    findAll(): Promise<Activity[]> {
        return this.activityService.findAll();
    }

    findOne(id: string): Promise<Activity | null> {
        return this.activityService.findOne(id);
    }
    
    update(id: string,updateActivityDto: UpdateActivityDto): Promise<Activity> {
    return this.activityService.update(id, updateActivityDto);
    }

    remove(id: string): Promise<Activity> {
        return this.activityService.remove(id);
    }
  
}