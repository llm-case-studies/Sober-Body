import { get, set } from 'idb-keyval'
import type { Deck } from './deck-types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateDeck(d: any): Deck {
  if (d.preset) {
    delete d.preset
    d.tags = [...(d.tags ?? []), 'official']
  }
  if (Array.isArray(d.tags)) {
    d.tags = d.tags.map((t: string) =>
      t.startsWith('topic:') ? `cat:${t.slice(6)}` : t
    )
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

export async function saveDeck(deck: Deck): Promise<void> {
  const arr = await loadDecks()
  const idx = arr.findIndex(d => d.id === deck.id)
  const entry = { ...deck, updated: Date.now() }
  if (idx >= 0) arr[idx] = entry
  else arr.push(entry)
  await saveDecks(arr)
}

export async function deleteDeck(id: string): Promise<void> {
  const arr = await loadDecks()
  await saveDecks(arr.filter(d => d.id !== id))
}

export function exportDeck(deck: Deck): string {
  return JSON.stringify(deck)
}

export async function importDeck(json: string): Promise<Deck> {
  const deck = migrateDeck(JSON.parse(json))
  const decks = await loadDecks()
  if (decks.some(d => d.id === deck.id)) deck.id = crypto.randomUUID()
  await saveDeck(deck)
  return deck
}

export async function importDeckFiles(
  files: FileList | File[],
  saver: (d: Deck) => Promise<void> = saveDeck
): Promise<{ imported: number; fails: string[] }> {
  const fails: string[] = []
  let imported = 0
  for (const file of Array.from(files)) {
    if (!file.name.endsWith('.json')) continue
    const text = await file.text()
    try {
      const deck = migrateDeck(JSON.parse(text))
      if (!deck.id || !deck.lines) {
        fails.push(`${file.name}: missing id or lines`)
        continue
      }
      if (!deck.tags?.some((t: string) => t.startsWith('cat:')))
        deck.tags = [...(deck.tags ?? []), 'cat:uncategorised']
      await saver(deck)
      imported++
    } catch {
      fails.push(`${file.name}: invalid JSON`)
    }
  }
  return { imported, fails }
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
