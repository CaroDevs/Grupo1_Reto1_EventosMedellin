import { ActivityStatus } from "@prisma/client";
import { ActivityState } from "../Interfaces/activityState.interface";
import { DraftState } from "../state/draft.state";
import { PublishState } from "../state/publish.state";
import { CancelState } from "../state/cancel.state";
import { FinishState } from "../state/finish.state";

export class ActivityDomain
{
    public id: string;
    public title: string;
    public status: ActivityStatus;
    public startDate: string;

    private readonly states: Record<ActivityStatus, ActivityState> = {
        [ActivityStatus.DRAFT]: new DraftState(),
        [ActivityStatus.PUBLISHED]: new PublishState(),
        [ActivityStatus.CANCELLED]: new CancelState(),
        [ActivityStatus.FINISHED]: new FinishState(),
    };

    constructor(params: {
        id: string;
        title: string;
        status: ActivityStatus;
        startDate: string;
    }) {
        this.id = params.id;
        this.title = params.title;
        this.status = params.status;
        this.startDate = params.startDate;
    }

    private getState(): ActivityState {
        return this.states[this.status];
    }

    public canEdit(): boolean {
        return this.getState().canEdit();
    }

    public publish(): void {
        this.getState().publish(this);
    }

    public cancel(): void {
        this.getState().cancel(this);
    }

    public finish(): void {
        this.getState().finish(this);
    }
}