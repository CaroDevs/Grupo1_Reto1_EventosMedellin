import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { InvalidStateTransitionError } from "../domain/invalid.state.transition";

export class FinishState implements ActivityState {
    readonly status = ActivityStatus.FINISHED

    canEdit(): boolean {
        return false;
    }

    publish(_activity: ActivityDomain): void {
        throw new InvalidStateTransitionError('No se puede publicar una actividad finalizada');
    }

    cancel(_activity: ActivityDomain): void {
        throw new InvalidStateTransitionError('No se puede cancelar una actividad finalizada');
    }

    finish(_activity: ActivityDomain): void {
        throw new InvalidStateTransitionError('La actividad ya está finalizada');
    }


}