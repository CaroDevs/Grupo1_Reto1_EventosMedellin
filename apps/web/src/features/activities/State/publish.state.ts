import { IActivityState } from "../Interface/activityState";


export class PublishState implements IActivityState {
  readonly status = 'PUBLISHED' as const;
  readonly label = 'Publicada';
  readonly badgeClass = 'text-bg-success';

  canEdit(): boolean { return true; }
  canPublish(): boolean { return false; }
  canCancel(): boolean { return true; }
  isVisibleToPublic(): boolean { return true; }
}
