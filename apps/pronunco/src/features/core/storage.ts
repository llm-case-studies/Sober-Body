import { get, set } from 'idb-keyval'
import { type DrinkEvent } from './bac'

export const KEYS = { drinks: 'sb_drinks', settings: 'sb_settings' } as const

export async function loadDrinks(): Promise<DrinkEvent[]> {
  return (await get(KEYS.drinks)) ?? []
}

export async function saveDrinks(arr: DrinkEvent[]): Promise<void> {
  await set(KEYS.drinks, arr)
}

export interface Settings {
  weightKg?: number
  sex?: 'm' | 'f'
  beta?: number
  nativeLang?: string
  locale?: string
  slowSpeech?: boolean
  useAzure?: boolean
}

export async function loadSettings(): Promise<Settings | undefined> {
  return (await get(KEYS.settings)) ?? undefined
}

export async function saveSettings(obj: Settings): Promise<void> {
  await set(KEYS.settings, obj)
}
