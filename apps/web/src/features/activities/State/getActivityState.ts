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

export function getActivityState(status: ActivityStatus): IActivityState {
  return STATES[status];
}