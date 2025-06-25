import React, { useState } from 'react'
import { estimateBAC, hoursToSober } from '../features/core/bac'
import { useDrinkLog } from '../features/core/drink-context'
import { useSettings } from '../features/core/settings-context'
import DrinkButtons from './DrinkButtons'
import SettingsModal from './SettingsModal'
import PronunciationChallenge from '../features/games/PronunciationChallenge'

export default function BacDashboard() {
  const { drinks } = useDrinkLog()
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [game, setGame] = useState(false)

  const bac = estimateBAC(drinks, settings)
  const sober = hoursToSober(bac, settings)

  return (
    <div>
      <header className="flex justify-between items-center mb-4">
        <h1>BAC Dashboard</h1>
        <button aria-label="settings" onClick={() => setOpen(true)}>
          ⚙︎
        </button>
        <button aria-label="play game" onClick={() => setGame(true)}>
          🎮
        </button>
      </header>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
      {game && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <PronunciationChallenge onClose={() => setGame(false)} />
        </div>
      )}
      <p>Current BAC: {bac.toFixed(3)}%</p>
      <p>Hours to sober: {sober.toFixed(1)}</p>
      <DrinkButtons />
    </div>
  )
}
