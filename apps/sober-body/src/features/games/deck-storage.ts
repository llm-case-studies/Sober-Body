import { get, set } from 'idb-keyval'
import type { Deck } from './deck-types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateDeck(d: any): Deck {
  if (d.preset) {
    delete d.preset
    d.tags = [...(d.tags ?? []), 'official']
  }
  return d
}

const KEY = 'pc_decks'

export async function loadDecks(): Promise<Deck[]> {
  const arr = (await get(KEY)) ?? []
  arr.forEach(migrateDeck)
  return arr
}

export async function saveDecks(arr: Deck[]): Promise<void> {
  await set(KEY, arr)
}

const modules = import.meta.glob<{ default: Deck }>('/src/presets/*.json', { eager: true })
const presets: Deck[] = Object.values(modules).map(m => migrateDeck(m.default))

export async function seedPresetDecks() {
  const existing = await loadDecks()
  const byId = new Set(existing.map(d => d.id))
  const fresh = presets
    .filter(p => !byId.has(p.id))
    .map(p => ({ ...p, updated: Date.now() }))
  if (fresh.length) saveDecks([...existing, ...fresh])
}
