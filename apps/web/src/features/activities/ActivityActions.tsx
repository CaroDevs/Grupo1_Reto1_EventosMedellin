import type { Activity } from './Interface/Activity';
import { getActivityState } from './State/getActivityState';


interface ActivityActionsProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onPublish: (activity: Activity) => void;
  onCancel: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  className?: string;
}

export function ActivityActions({
  activity,
  onEdit,
  onPublish,
  onCancel,
  onDelete,
  className = '',
}: Readonly<ActivityActionsProps>) {
  const state = getActivityState(activity.status);

  return (
    <div className={`d-flex flex-wrap gap-2 ${className}`}>
      {state.canPublish() && (
        <button type="button" className="btn btn-sm btn-outline-success" onClick={() => onPublish(activity)}>
          <i className="fa-solid fa-bullhorn" /> Publicar
        </button>
      )}
      {state.canEdit() && (
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(activity)}>
          <i className="fa-solid fa-pen" /> Editar
        </button>
      )}
      {state.canCancel() && (
        <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => onCancel(activity)}>
          <i className="fa-solid fa-ban" /> Cancelar
        </button>
      )}
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(activity)}>
        <i className="fa-solid fa-trash" /> Borrar
      </button>
    </div>
  );
}