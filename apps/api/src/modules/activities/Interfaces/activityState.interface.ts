import { ActivityStatus } from '@prisma/client';
import { ActivityDomain } from "../domain/activity.domain";

export interface ActivityState {
    readonly status: ActivityStatus;
    canEdit(): boolean;
    publish(activity: ActivityDomain): void;
    cancel(activity: ActivityDomain): void;
    finish(activity: ActivityDomain): void;
}