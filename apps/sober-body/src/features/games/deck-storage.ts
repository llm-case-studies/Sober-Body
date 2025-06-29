import { get, set } from 'idb-keyval'

export interface Deck {
  id: string
  title: string
  lang: string
  preset?: boolean
  lines: string[]
  created_at?: number
}

const KEY = 'pc_decks'

export async function loadDecks(): Promise<Deck[]> {
  return (await get(KEY)) ?? []
}

export async function saveDecks(arr: Deck[]): Promise<void> {
  await set(KEY, arr)
}

const modules = import.meta.glob<{ default: Deck }>('/public/presets/*.json', { eager: true })
const presets: Deck[] = Object.values(modules).map(m => m.default)

export async function seedPresetDecks() {
  const existing = await loadDecks()
  const byId = new Set(existing.map(d => d.id))
  const fresh = presets
    .filter(p => !byId.has(p.id))
    .map(p => ({ ...p, created_at: Date.now() }))
  if (fresh.length) saveDecks([...existing, ...fresh])
}
