/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'
import { DrinkEvent } from './bac'

export interface DrinkLogValue {
  log: DrinkEvent[]
  addDrink: (d: DrinkEvent) => void
}

const DrinkLogContext = createContext<DrinkLogValue | undefined>(undefined)

export function DrinkLogProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<DrinkEvent[]>([])
  const addDrink = (d: DrinkEvent) => setLog(prev => [...prev, d])
  return (
    <DrinkLogContext.Provider value={{ log, addDrink }}>
      {children}
    </DrinkLogContext.Provider>
  )
}

export function useDrinkLog() {
  const ctx = useContext(DrinkLogContext)
  if (!ctx) throw new Error('useDrinkLog must be used within DrinkLogProvider')
  return ctx
}
