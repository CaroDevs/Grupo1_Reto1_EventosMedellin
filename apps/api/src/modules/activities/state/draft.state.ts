import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { BadRequestException } from "@nestjs/common";

export class DraftState implements ActivityState {
    readonly status = ActivityStatus.DRAFT

   canEdit(): boolean {
       return true;
   }
    publish(activity: ActivityDomain): void {
        activity.status = ActivityStatus.PUBLISHED;
    }

    cancel(activity: ActivityDomain): void {
        activity.status = ActivityStatus.CANCELLED;
    }

    finish(_activity: ActivityDomain): void {
        throw new BadRequestException('Una actividad en borrador (DRAFT) no puede finalizarse directamente');
    }
   
}