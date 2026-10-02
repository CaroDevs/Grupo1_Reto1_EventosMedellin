import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './shared/layout/NavBar';
import { ActivitiesPage } from './routes/public/ActivitiesPage';
import { LoginPage } from './routes/auth/LoginPage';
import { RegisterPage } from './routes/auth/RegisterPage';

export function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/activities" replace />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}
