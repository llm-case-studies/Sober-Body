/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { type DrinkEvent } from './bac'
import { loadDrinks, saveDrinks } from './storage'

export interface DrinkLogValue {
  drinks: DrinkEvent[]
  addDrink: (d: DrinkEvent) => void
  clear: () => void
}

const DrinkLogContext = createContext<DrinkLogValue | undefined>(undefined)

export function DrinkLogProvider({ children }: { children: React.ReactNode }) {
  const [drinks, setDrinks] = useState<DrinkEvent[]>([])
  const loaded = useRef(false)

  useEffect(() => {
    loadDrinks().then(arr => {
      setDrinks(arr)
      loaded.current = true
    })
  }, [])

  useEffect(() => {
    if (loaded.current) {
      saveDrinks(drinks)
    }
  }, [drinks])

  const addDrink = (d: DrinkEvent) => setDrinks(prev => [...prev, d])
  const clear = () => setDrinks([])

  return (
    <DrinkLogContext.Provider value={{ drinks, addDrink, clear }}>
      {children}
    </DrinkLogContext.Provider>
  )
}

export function useDrinkLog() {
  const ctx = useContext(DrinkLogContext)
  if (!ctx) throw new Error('useDrinkLog must be used within DrinkLogProvider')
  return ctx
}
