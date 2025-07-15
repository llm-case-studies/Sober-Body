import 'ui/mobile.css';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import DeckManager from './components/DeckManager';
import CoachPage from './pages/CoachPage';
import ChallengePage from './pages/ChallengePage';
import SettingsPage from './pages/SettingsPage';
import TeacherWizardPage from './pages/TeacherWizardPage';
import { DeckProvider } from '../../sober-body/src/features/games/deck-context';
import { seedPresetDecks } from '../../sober-body/src/features/games/deck-storage';
import SidebarLayout from './components/SidebarLayout';
import DeckListMobile from './components/DeckListMobile';
import { useIsMobile } from 'ui';
import { useSettings } from './features/core/settings-context';
import MobileShell from './components/MobileShell';

function CoachPageWrapper() {
  const { deckId = '' } = useParams<{ deckId: string }>();
  return (
    <DeckProvider>
      <CoachPage />
    </DeckProvider>
  );
}

function DeckManagerWrapper() {
  return (
    <DeckProvider>
      <DeckManager />
    </DeckProvider>
  );
}

function MobileDeckManagerWrapper() {
  return (
    <DeckProvider>
      <DeckListMobile />
    </DeckProvider>
  );
}

function AppRoutes() {
  const { settings } = useSettings();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isMobileView = isMobile || settings.enableMobileBeta || location.pathname.startsWith('/m/');

  if (isMobileView) {
    return (
      <MobileShell>
        <Routes>
          <Route path="/m/decks" element={<MobileDeckManagerWrapper />} />
          <Route path="/m/coach/:deckId" element={<CoachPageWrapper />} />
          <Route path="/m/c/:data" element={<ChallengePage />} />
          <Route path="/m/settings" element={<SettingsPage />} />
          <Route path="/m/teacher-wizard" element={<TeacherWizardPage />} />
          <Route path="*" element={<Navigate to="/m/decks" replace />} />
        </Routes>
      </MobileShell>
    );
  }

  return (
    <SidebarLayout>
      <Routes>
        <Route path="/decks" element={<DeckManagerWrapper />} />
        <Route path="/coach/:deckId" element={<CoachPageWrapper />} />
        <Route path="/c/:data" element={<ChallengePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/teacher-wizard" element={<TeacherWizardPage />} />
        <Route path="*" element={<Navigate to="/decks" replace />} />
      </Routes>
    </SidebarLayout>
  );
}

export default function App() {
  useEffect(() => {
    seedPresetDecks();
  }, []);

  return (
    <BrowserRouter basename="/pc">
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
