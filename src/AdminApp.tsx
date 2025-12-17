import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';

export default function AdminApp() {
  return (
    <TournamentProvider>
      <HashRouter>
        <Routes>
          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ADMIN ROUTES */}
          <Route path="/Login" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </TournamentProvider>
  );
}
