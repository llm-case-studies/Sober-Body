import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DeckManager from './components/DeckManager'
import CoachPage from './pages/CoachPage'

export default function App() {
  return (
    <BrowserRouter basename="/pc">
      <Routes>
        <Route path="/" element={<Navigate to="/decks" replace />} />
        <Route path="/decks" element={<DeckManager />} />
        <Route path="coach/:deckId" element={<CoachPage />} />
        <Route path="*" element={<Navigate to="decks" />} />
      </Routes>
    </BrowserRouter>
  )
}
