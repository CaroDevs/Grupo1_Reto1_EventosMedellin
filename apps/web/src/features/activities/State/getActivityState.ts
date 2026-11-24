import type { ActivityStatus } from '../Interface/Activity';
import type { IActivityState } from '../Interface/activityState';
import { DraftState } from './draft.state';
import { PublishState } from './publish.state';
import { CancelState } from './cancel.state';
import { FinishState } from './finish.state';

const STATES: Record<ActivityStatus, IActivityState> = {
  DRAFT: new DraftState(),
  PUBLISHED: new PublishState(),
  CANCELLED: new CancelState(),
  FINISHED: new FinishState(),
};

// Estado seguro para valores desconocidos (p. ej. un estado nuevo del backend):
// no permite ninguna acción y no se muestra al público.
const UNKNOWN_STATE: IActivityState = {
  status: 'DRAFT',
  label: 'Desconocido',
  badgeClass: 'text-bg-light',
  canEdit: () => false,
  canPublish: () => false,
  canCancel: () => false,
  isVisibleToPublic: () => false,
};

export function getActivityState(status: ActivityStatus): IActivityState {
  return STATES[status] ?? UNKNOWN_STATE;
}