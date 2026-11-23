import { ActivityStatus } from "../Interface/Activity";
import { getActivityState } from "./getActivityState";


export function ActivityStageBadge({ status }: Readonly<{ status: ActivityStatus }>) {
  const state = getActivityState(status);

  return <span className={`badge ${state.badgeClass}`}>{state.label}</span>;
}