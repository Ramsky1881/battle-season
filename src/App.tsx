import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';

// Layouts
import ViewerLayout from './layouts/ViewerLayout';

// Pages
import ViewerPage from './pages/viewer/Landing';

export default function App() {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/tournament" replace />} />

          {/* VIEWER ROUTES */}
          <Route path="/tournament" element={<ViewerLayout />}>
            <Route index element={<ViewerPage />} />
            <Route path="room/:roomId" element={<ViewerPage />} />
            {/* Note: In this version ViewerPage handles its own room state from context/admin setting,
                but we support URL param for future deep linking if needed.
                Currently ViewerPage uses appState.activeRoomViewer from Firebase.
            */}
          </Route>

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/tournament" replace />} />

        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
}
