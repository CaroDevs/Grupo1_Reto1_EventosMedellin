import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { BadRequestException } from "@nestjs/common";

export class PublishState implements ActivityState {
    readonly status = ActivityStatus.PUBLISHED

   canEdit(): boolean {
       return true;
   }
    publish(_activity: ActivityDomain): void {
        throw new BadRequestException('La actividad ya se encuentra publicada');
    }

    cancel(activity: ActivityDomain): void {
        activity.status = ActivityStatus.CANCELLED;
    }

    finish(activity: ActivityDomain): void {
        activity.status = ActivityStatus.FINISHED;
    }
   
}