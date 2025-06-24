import './App.css'
import { Routes, Route } from 'react-router-dom'
import BacDashboard from './components/BacDashboard'
import LandingPage from './components/LandingPage'
import { DrinkLogProvider } from './features/core/drink-context'

function App() {
  return (
    <DrinkLogProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<BacDashboard />} />
      </Routes>
    </DrinkLogProvider>
  )
}

export default App
