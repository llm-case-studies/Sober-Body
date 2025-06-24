import React from 'react'
import { estimateBAC, hoursToSober } from '../features/core/bac'
import { useDrinkLog } from '../features/core/drink-context'
import DrinkButtons from './DrinkButtons'

export default function BacDashboard() {
  const { log } = useDrinkLog()
  const physiology = { weightKg: 70, sex: 'm' } as const
  const bac = estimateBAC(log, physiology)
  const sober = hoursToSober(bac, physiology)

  return (
    <div>
      <h1>BAC Dashboard</h1>
      <p>Current BAC: {bac.toFixed(3)}%</p>
      <p>Hours to sober: {sober.toFixed(1)}</p>
      <DrinkButtons />
    </div>
  )
}
