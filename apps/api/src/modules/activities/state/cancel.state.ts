import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { BadRequestException } from "@nestjs/common";

export class CancelState implements ActivityState {
    readonly status = ActivityStatus.CANCELLED

   canEdit(): boolean {
       return false;
   }
   publish(_activity: ActivityDomain): void {
    throw new BadRequestException('No se puede publicar una actividad cancelada');
  }

  cancel(_activity: ActivityDomain): void {
    throw new BadRequestException('La actividad ya está cancelada');
  }

  finish(_activity: ActivityDomain): void {
    throw new BadRequestException('No se puede finalizar una actividad cancelada');
  }
   
}