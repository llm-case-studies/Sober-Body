import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import DeckManager from './components/DeckManager'

export function CoachStub() {
  const { deckId } = useParams()
  return (
    <div>
      <h3>{deckId}</h3>
      <p>Coming soon</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/pc">
      <Routes>
        <Route path="/" element={<Navigate to="/decks" replace />} />
        <Route path="/decks" element={<DeckManager />} />
        <Route path="/coach/:deckId" element={<CoachStub />} />
      </Routes>
    </BrowserRouter>
  )
}
