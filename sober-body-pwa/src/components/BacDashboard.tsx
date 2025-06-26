import React from 'react'
import { estimateBAC, hoursToSober } from '../features/core/bac'
import { useDrinkLog } from '../features/core/drink-context'
import { useSettings } from '../features/core/settings-context'
import DrinkButtons from './DrinkButtons'
import SettingsModal from './SettingsModal'
import PronunciationModal from './PronunciationModal'
import { useModal } from './ModalContext'

export default function BacDashboard() {
  const { drinks } = useDrinkLog()
  const { settings } = useSettings()
  const { active, open, close } = useModal()

  const bac = estimateBAC(drinks, settings)
  const sober = hoursToSober(bac, settings)

  return (
    <div>
      <header className="flex justify-between items-center mb-4">
        <h1>BAC Dashboard</h1>
        <button aria-label="settings" onClick={() => open('settings')}>
          ⚙︎
        </button>
        <button aria-label="play game" onClick={() => open('twister')}>
          🎮
        </button>
      </header>
      <SettingsModal open={active === 'settings'} onClose={close} />
      <PronunciationModal open={active === 'twister'} onClose={close} />
      <p>Current BAC: {bac.toFixed(3)}%</p>
      <p>Hours to sober: {sober.toFixed(1)}</p>
      <DrinkButtons />
    </div>
  )
}
