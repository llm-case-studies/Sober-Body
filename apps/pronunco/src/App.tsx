import { Routes, Route, Navigate } from 'react-router-dom'
import DeckManager from './components/DeckManager'

function DrillPage() {
  return <div>Drill placeholder</div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/decks" replace />} />
      <Route path="/decks" element={<DeckManager />} />
      <Route path="/coach" element={<DrillPage />} />
    </Routes>
  )
}
