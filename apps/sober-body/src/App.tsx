import './App.css'
import { Routes, Route } from 'react-router-dom'
import BacDashboard from './components/BacDashboard'
import LandingPage from './components/LandingPage'
import CoachPage from './pages/coach'
import { DrinkLogProvider } from './features/core/drink-context'
import { SettingsProvider } from './features/core/settings-context'

function App() {
  return (
    <SettingsProvider>
      <DrinkLogProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<BacDashboard />} />
          <Route path="/coach" element={<CoachPage />} />
        </Routes>
      </DrinkLogProvider>
    </SettingsProvider>
  )
}

export default App
