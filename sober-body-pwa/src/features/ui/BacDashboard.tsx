import React from 'react'
import { estimateBAC, hoursToSober, DrinkEvent, Physiology } from '../core/bac'

const DEMO_DRINKS: DrinkEvent[] = [
  { volumeMl: 330, abv: 0.05, date: new Date(Date.now() - 60 * 60 * 1000) },
  { volumeMl: 150, abv: 0.12, date: new Date(Date.now() - 30 * 60 * 1000) }
]

const DEMO_PHYSIOLOGY: Physiology = { weightKg: 70, sex: 'm' }

export default function BacDashboard() {
  const bac = estimateBAC(DEMO_DRINKS, DEMO_PHYSIOLOGY)
  const hours = hoursToSober(bac, DEMO_PHYSIOLOGY)
  return (
    <div>
      <h1>Demo BAC Dashboard</h1>
      <p data-testid="bac">BAC: {bac.toFixed(3)}%</p>
      <p data-testid="hours">Hours to sober: {hours.toFixed(1)}</p>
    </div>
  )
}
