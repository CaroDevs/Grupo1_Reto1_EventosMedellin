import { IActivityState } from "../Interface/activityState";


export class FinishState implements IActivityState {
  readonly status = 'FINISHED' as const;
  readonly label = 'Finalizada';
  readonly badgeClass = 'text-bg-dark';

  canEdit(): boolean { return false; }
  canPublish(): boolean { return false; }
  canCancel(): boolean { return false; }
  isVisibleToPublic(): boolean { return false; }
}

