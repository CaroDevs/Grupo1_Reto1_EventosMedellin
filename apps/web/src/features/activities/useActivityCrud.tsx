import { useState } from 'react';
import { apiDelete, apiPatch } from '../../shared/http/client';
import type { Activity } from './Interface/Activity';
import { EditActivityModal } from './EditActivityModal';
import { ConfirmDeleteModal } from '../admin/ConfirmDeleteModal';
import { ConfirmCancelActivity } from './State/ConfirmCancelActivity';

export function useActivityCrud(reload: () => void | Promise<void>) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [cancellingActivity, setCancellingActivity] = useState<Activity | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deletingActivity) return;

    await apiDelete(`/activities/${deletingActivity.id}`);
    setDeletingActivity(null);
    await reload();
  }

  async function runTransition(path: string) {
    setActionError(null);

    try {
      await apiPatch(path, {});
    } catch (err) {
      console.error('Error al cambiar el estado de la actividad:', err);
      setActionError(
        'No se pudo cambiar el estado de la actividad. Es posible que ya haya cambiado; se recargó la información.',
      );
    } finally {
      await reload();
    }
  }

  async function publishActivity(activity: Activity) {
    await runTransition(`/activities/${activity.id}/publish`);
  }

  async function confirmCancel() {
    if (!cancellingActivity) return;

    const target = cancellingActivity;
    setCancellingActivity(null);
    await runTransition(`/activities/${target.id}/cancel`);
  }

  const modals = (
    <>
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSaved={() => {
            setEditingActivity(null);
            void reload();
          }}
        />
      )}

      {deletingActivity && (
        <ConfirmDeleteModal
          name={deletingActivity.title}
          title="Borrar actividad"
          onCancel={() => setDeletingActivity(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}

      {cancellingActivity && (
        <ConfirmCancelActivity
          name={cancellingActivity.title}
          onClose={() => setCancellingActivity(null)}
          onConfirm={() => void confirmCancel()}
        />
      )}

      {actionError && (
        <div
          className="alert alert-danger alert-dismissible position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
          style={{ zIndex: 2000 }}
          role="alert"
        >
          {actionError}
          <button type="button" className="btn-close" onClick={() => setActionError(null)} aria-label="Cerrar" />
        </div>
      )}
    </>
  );

  return {
    setEditingActivity,
    setDeletingActivity,
    setCancellingActivity,
    publishActivity,
    modals,
  };
}