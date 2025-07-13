import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import DeckManager from './components/DeckManager'
import CoachPage from './pages/CoachPage'
import ChallengePage from './pages/ChallengePage'
import SettingsPage from './pages/SettingsPage'
import TeacherWizardPage from './pages/TeacherWizardPage'
import { DeckProvider } from '../../sober-body/src/features/games/deck-context'
import { seedPresetDecks } from '../../sober-body/src/features/games/deck-storage'

function CoachPageWrapper() {
  const { deckId = '' } = useParams<{ deckId: string }>()
  return (
    <DeckProvider>
      <CoachPage />
    </DeckProvider>
  )
}

import SidebarLayout from './components/SidebarLayout'

// ... (rest of your imports and CoachPageWrapper function)

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/decks" replace />} />
      <Route path="/decks" element={<DeckManager />} />
      <Route path="/coach/:deckId" element={<CoachPageWrapper />} />
      <Route path="/c/:data" element={<ChallengePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/teacher-wizard" element={<TeacherWizardPage />} />
      <Route path="*" element={<Navigate to="/decks" />} />
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    // Ensure preset decks are loaded
    seedPresetDecks()
  }, [])

  return (
    <BrowserRouter basename="/pc">
      <SidebarLayout>
        <AppRoutes />
      </SidebarLayout>
    </BrowserRouter>
  )
}
