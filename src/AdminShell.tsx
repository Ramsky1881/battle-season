import { Routes, Route } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';

export default function AdminShell() {
  return (
    <TournamentProvider>
      <Routes>
        <Route element={<AdminLayout />}>
           <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </TournamentProvider>
  );
}
