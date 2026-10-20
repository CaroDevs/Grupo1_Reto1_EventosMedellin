import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './shared/layout/NavBar';
import { RequireAdmin } from './shared/auth/RequireAdmin';
import { LoginPage } from './routes/auth/LoginPage';
import { RegisterPage } from './routes/auth/RegisterPage';
import { UsersAdminPage } from './routes/admin/UsersAdminPage';
import { ActivityPage } from './features/activities/activityPage';

export function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/activities" replace />} />
        <Route path="/activities" element={<ActivityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <UsersAdminPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </>
  );
}
