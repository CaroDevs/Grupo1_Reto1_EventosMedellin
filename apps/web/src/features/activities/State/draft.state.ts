import { IActivityState } from "../Interface/activityState";


export class DraftState implements IActivityState {
  readonly status = 'DRAFT' as const;
  readonly label = 'Borrador';
  readonly badgeClass = 'text-bg-secondary';

  canEdit(): boolean { return true; }
  canPublish(): boolean { return true; }
  canCancel(): boolean { return true; }
  isVisibleToPublic(): boolean { return false; }
}