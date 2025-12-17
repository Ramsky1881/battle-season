import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';

// Layouts
import ViewerLayout from './layouts/ViewerLayout';

// Pages
import TournamentView from './pages/viewer/TournamentView';
import AdminLogin from './pages/admin/Login';

export default function App() {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/tournament" replace />} />

          {/* VIEWER ROUTES */}
          <Route path="/tournament" element={<ViewerLayout />}>
            <Route index element={<TournamentView />} />
            <Route path="room/:roomId" element={<TournamentView />} />
          </Route>

          {/* ADMIN LOGIN */}
          <Route path="/login" element={<AdminLogin />} />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/tournament" replace />} />

        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
}
