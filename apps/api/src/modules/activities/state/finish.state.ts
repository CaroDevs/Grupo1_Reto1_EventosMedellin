import { ActivityStatus } from "@prisma/client";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityState } from "../Interfaces/activityState.interface";
import { BadRequestException } from "@nestjs/common";

export class FinishState implements ActivityState {
    readonly status = ActivityStatus.FINISHED

    canEdit(): boolean {
        return false;
    }

    publish(_activity: ActivityDomain): void {
        throw new BadRequestException('No se puede publicar una actividad finalizada');
    }

    cancel(_activity: ActivityDomain): void {
        throw new BadRequestException('No se puede cancelar una actividad finalizada');
    }

    finish(_activity: ActivityDomain): void {
        throw new BadRequestException('La actividad ya está finalizada');
    }


}