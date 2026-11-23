import { ActivityStatus } from "./Activity";

export interface IActivityState {
  readonly status: ActivityStatus;
  readonly label: string;
  readonly badgeClass: string;
  canEdit(): boolean;
  canPublish(): boolean;
  canCancel(): boolean;
  isVisibleToPublic(): boolean;
}