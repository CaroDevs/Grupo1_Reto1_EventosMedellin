import { useEffect, useState } from 'react';
import { apiGet } from '../../shared/http/client';
import { useSessionUser } from '../../shared/auth/session';
import { ADMIN_ROLE } from '@medellin-activities/shared-types';
import { AdminSummaryCard } from '../../features/admin/AdminSummaryCard';
import { AdminSectionModal } from '../../features/admin/AdminSectionModal';
import { UsersAdminPanel } from '../../features/admin/UsersAdminPanel';
import { CategoriesPanel } from '../../features/categories/categoriesPanel';
import { ActivityForm } from '../../features/activities/activityForm';
import { ActivitiesMap } from '../../features/activities/ActivitiesMap';
import { ActivitiesList } from '../../features/activities/ActivitiesList';

interface AdminSummary {
  totalUsers: number;
  totalCategories: number;
  totalActivities: number;
}

type OpenSection = 'users' | 'categories' | 'activities' | null;

export function AdminPanelPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const [activitiesRefreshKey, setActivitiesRefreshKey] = useState(0);
  const user = useSessionUser();
  const isAdmin = user?.role.name === ADMIN_ROLE;

  function loadSummary() {
    apiGet<AdminSummary>('/admin/summary')
      .then(setSummary)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    loadSummary();
  }, []);

  function closeSection() {
    setOpenSection(null);
    // Los conteos pueden haber cambiado mientras el modal estuvo abierto.
    loadSummary();
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Panel de administración</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          No se pudo cargar el resumen: {error}
        </div>
      )}

      <div className="row g-4">
        {isAdmin && (
          <AdminSummaryCard
            title="Usuarios"
            icon="fa-users"
            count={summary?.totalUsers ?? null}
            onManage={() => setOpenSection('users')}
          />
        )}
        <AdminSummaryCard
          title="Categorías"
          icon="fa-tags"
          count={summary?.totalCategories ?? null}
          onManage={() => setOpenSection('categories')}
        />
        <AdminSummaryCard
          title="Actividades"
          icon="fa-calendar-days"
          count={summary?.totalActivities ?? null}
          onManage={() => setOpenSection('activities')}
        />
      </div>

      {openSection === 'users' && (
        <AdminSectionModal title="Administrar usuarios" onClose={closeSection}>
          <UsersAdminPanel />
        </AdminSectionModal>
      )}

      {openSection === 'categories' && (
        <AdminSectionModal title="Administrar categorías" onClose={closeSection}>
          <CategoriesPanel />
        </AdminSectionModal>
      )}

      {openSection === 'activities' && (
        <AdminSectionModal title="Administrar actividades" fullscreen onClose={closeSection}>
          <ActivityForm
            onActivityCreated={() => setActivitiesRefreshKey((prev) => prev + 1)}
          />
          <hr className="my-4" />
          <ActivitiesMap key={activitiesRefreshKey} />
          <hr className="my-4" />
          <ActivitiesList key={`list-${activitiesRefreshKey}`} />
        </AdminSectionModal>
      )}
    </div>
  );
}
