/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { loadSettings, saveSettings, type Settings } from './storage'
import { DEFAULT_BETA } from './bac'
export interface SettingsValue {
  settings: Required<Settings>
  setSettings: React.Dispatch<React.SetStateAction<Required<Settings>>>
}
const DEFAULTS: Required<Settings> = {
  weightKg: 70,
  sex: 'm',
  beta: DEFAULT_BETA,
  nativeLang: 'en',
  locale: 'en',
  slowSpeech: false
}
const SettingsContext = createContext<SettingsValue | undefined>(undefined)
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Required<Settings>>(DEFAULTS)
  const loaded = useRef(false)
  useEffect(() => {
    loadSettings().then(stored => {
      if (stored) setSettings(prev => ({ ...prev, ...stored }))
      loaded.current = true
    })
  }, [])
  useEffect(() => {
    if (loaded.current) {
      saveSettings(settings)
    }
  }, [settings])
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
