import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import DeckManager from './components/DeckManager'
import CoachPage from './pages/CoachPage'
import { DeckProvider } from './features/deck-context'

function CoachPageWrapper() {
  const { deckId = '' } = useParams<{ deckId: string }>()
  return (
    <DeckProvider deckId={deckId}>
      <CoachPage />
    </DeckProvider>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/decks" replace />} />
      <Route path="/decks" element={<DeckManager />} />
      <Route path="/coach/:deckId" element={<CoachPageWrapper />} />
      <Route path="*" element={<Navigate to="/decks" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/pc">
      <AppRoutes />
    </BrowserRouter>
  )
}
