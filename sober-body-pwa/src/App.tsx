import './App.css'
import BacDashboard from './components/BacDashboard'
import { DrinkLogProvider } from './features/core/drink-context'
function App() {
  return (
    <DrinkLogProvider>
      <div className="app">
        <BacDashboard />
      </div>
    </DrinkLogProvider>
  )
}

export default App
