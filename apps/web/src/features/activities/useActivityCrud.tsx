import { useState } from 'react';
import { apiDelete } from '../../shared/http/client';
import type { Activity } from './Activity';
import { EditActivityModal } from './EditActivityModal';
import { ConfirmDeleteModal } from '../admin/ConfirmDeleteModal';

// El mapa y el listado necesitan exactamente lo mismo para editar/borrar una
// actividad (mismo estado, mismos modales) — antes cada uno lo repetía por
// su cuenta. Este hook es la única pieza que lo sabe hacer.
export function useActivityCrud(reload: () => void | Promise<void>) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  async function confirmDelete() {
    if (!deletingActivity) return;

    await apiDelete(`/activities/${deletingActivity.id}`);
    setDeletingActivity(null);
    await reload();
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
    </>
  );

  return { setEditingActivity, setDeletingActivity, modals };
}
