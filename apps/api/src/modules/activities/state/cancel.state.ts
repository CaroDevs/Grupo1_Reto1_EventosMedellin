import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { InvalidStateTransitionError } from "../domain/invalid.state.transition";

export class CancelState implements ActivityState {
    readonly status = ActivityStatus.CANCELLED

   canEdit(): boolean {
       return false;
   }
   publish(_activity: ActivityDomain): void {
    throw new InvalidStateTransitionError('No se puede publicar una actividad cancelada');
  }

  cancel(_activity: ActivityDomain): void {
    throw new InvalidStateTransitionError('La actividad ya está cancelada');
  }

  finish(_activity: ActivityDomain): void {
    throw new InvalidStateTransitionError('No se puede finalizar una actividad cancelada');
  }
   
}