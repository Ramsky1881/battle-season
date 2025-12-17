import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ViewerLayout from './layouts/ViewerLayout';

// Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ViewerPage from './pages/viewer/Landing';

export default function App() {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/tournament" replace />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* VIEWER ROUTES */}
          <Route path="/tournament" element={<ViewerLayout />}>
            <Route index element={<ViewerPage />} />
            <Route path="room/:roomId" element={<ViewerPage />} />
            {/* Note: In this version ViewerPage handles its own room state from context/admin setting,
                but we support URL param for future deep linking if needed.
                Currently ViewerPage uses appState.activeRoomViewer from Firebase.
            */}
          </Route>

        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
}
