import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { InvalidStateTransitionError } from "../domain/invalid.state.transition";

export class PublishState implements ActivityState {
    readonly status = ActivityStatus.PUBLISHED

   canEdit(): boolean {
       return true;
   }
    publish(_activity: ActivityDomain): void {
        throw new InvalidStateTransitionError('La actividad ya se encuentra publicada');
    }

    cancel(activity: ActivityDomain): void {
        activity.status = ActivityStatus.CANCELLED;
    }

    finish(activity: ActivityDomain): void {
        activity.status = ActivityStatus.FINISHED;
    }
   
}