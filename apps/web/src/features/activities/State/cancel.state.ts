import { IActivityState } from "../Interface/activityState";


export class CancelState implements IActivityState {
  readonly status = 'CANCELLED' as const;
  readonly label = 'Cancelada';
  readonly badgeClass = 'text-bg-danger';

  canEdit(): boolean { return false; }
  canPublish(): boolean { return false; }
  canCancel(): boolean { return false; }
  isVisibleToPublic(): boolean { return false; }
}

