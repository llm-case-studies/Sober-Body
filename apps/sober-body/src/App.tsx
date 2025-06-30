import './App.css'
import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { seedPresetDecks } from './features/games/deck-storage'
import BacDashboard from './components/BacDashboard'
import LandingPage from './components/LandingPage'
import CoachPage from './pages/coach'
import DecksPage from './pages/decks'
import { DrinkLogProvider } from './features/core/drink-context'
import { SettingsProvider } from './features/core/settings-context'

function App() {
  useEffect(() => {
    seedPresetDecks()
  }, [])
  return (
    <SettingsProvider>
      <DrinkLogProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<BacDashboard />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/decks" element={<DecksPage />} />
        </Routes>
      </DrinkLogProvider>
    </SettingsProvider>
  )
}

export default App
