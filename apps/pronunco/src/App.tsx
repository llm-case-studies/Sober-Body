import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import DeckManager from './components/DeckManager';
import CoachPage from './pages/CoachPage';
import ChallengePage from './pages/ChallengePage';
import SettingsPage from './pages/SettingsPage';
import TeacherWizardPage from './pages/TeacherWizardPage';
import { DeckProvider, useDecks } from '../../sober-body/src/features/games/deck-context';
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
      <MobileDeckManagerInner />
    </DeckProvider>
  );
}

function MobileDeckManagerInner() {
  const { decks } = useDecks();
  const deckList = decks.map(deck => ({
    id: deck.id,
    title: deck.title,
    language: deck.language || 'Unknown'
  }));
  
  return <DeckListMobile decks={deckList} />;
}

function TeacherWizardPageWrapper() {
  return (
    <DeckProvider>
      <TeacherWizardPage />
    </DeckProvider>
  );
}

function AppRoutes() {
  const { settings } = useSettings();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only force mobile if explicitly on /m/ routes or mobile device + beta enabled
  const isMobileView = location.pathname.startsWith('/m/') || (isMobile && settings.enableMobileBeta);

  // Dynamically import mobile CSS only when needed
  useEffect(() => {
    if (isMobileView) {
      import('./styles/mobile.css');
    }
  }, [isMobileView]);

  if (isMobileView) {
    return (
      <MobileShell>
        <Routes>
          <Route path="/m/decks" element={<MobileDeckManagerWrapper />} />
          <Route path="/m/coach/:deckId" element={<CoachPageWrapper />} />
          <Route path="/m/c/:data" element={<ChallengePage />} />
          <Route path="/m/settings" element={<SettingsPage />} />
          <Route path="/m/teacher-wizard" element={<TeacherWizardPageWrapper />} />
          <Route path="/m/*" element={<Navigate to="/m/decks" replace />} />
          <Route path="/*" element={<Navigate to="/decks" replace />} />
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
        <Route path="/teacher-wizard" element={<TeacherWizardPageWrapper />} />
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
    <BrowserRouter basename={import.meta.env.VITE_ROUTER_BASE ?? '/'}>
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
