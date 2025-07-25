import './App.css'
import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { seedPresetDecks } from './features/games/deck-storage'
import BacDashboard from './components/BacDashboard'
import LandingPage from './components/LandingPage'
import CoachPage from './pages/coach'
import CoachLegacy from './pages/coach-legacy'
import DecksPage from './pages/decks'
import ChallengePage from './pages/challenge'
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
          <Route path="/coach/deck/:id" element={<CoachPage />} />
          <Route path="/coach" element={<CoachLegacy />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/challenge/:payload" element={<ChallengePage />} />
        </Routes>
      </DrinkLogProvider>
    </SettingsProvider>
  )
}

export default App
