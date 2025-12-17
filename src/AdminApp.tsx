import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/Login';
import AdminShell from './AdminShell';

export default function AdminApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard/*" element={<AdminShell />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}
