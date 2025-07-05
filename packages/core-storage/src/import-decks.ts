import Dexie from 'dexie'
import JSZip from 'jszip'
import { get, set } from 'idb-keyval'
import type { AppDB, Deck, Card } from './db'

const LEGACY_KEY = 'pc_decks'

function toRows(decks: any[]): { decks: Deck[]; cards: Card[] } {
  const deckRows: Deck[] = []
  const cardRows: Card[] = []
  for (const d of decks) {
    if (!d.id || !Array.isArray(d.lines)) continue
    const category = d.tags?.find((t: string) => t.startsWith('cat:'))
    deckRows.push({
      id: d.id,
      title: d.title,
      lang: d.lang,
      category: category ? category.slice(4) : undefined,
      updatedAt: Date.now(),
      tags: d.tags
    })
    d.lines.forEach((t: string) => {
      cardRows.push({ id: crypto.randomUUID(), deckId: d.id, text: t })
    })
  }
  return { decks: deckRows, cards: cardRows }
}

async function dualWriteLegacy(decks: any[]) {
  const arr = (await get(LEGACY_KEY)) ?? []
  arr.push(...decks)
  await set(LEGACY_KEY, arr)
}

async function writeAll(decks: any[], db: AppDB) {
  const { decks: deckRows, cards } = toRows(decks)
  await db.transaction('rw', db.decks, db.cards, async () => {
    if (deckRows.length) await db.decks.bulkAdd(deckRows)
    if (cards.length) await db.cards.bulkAdd(cards)
  })
  await dualWriteLegacy(decks)
}

export async function importDeckFolder(files: FileList | File[], db: AppDB) {
  const decks: any[] = []
  for (const file of Array.from(files)) {
    if (!file.name.endsWith('.json')) continue
    try {
      decks.push(JSON.parse(await file.text()))
    } catch {}
  }
  await writeAll(decks, db)
}

export async function importDeckZip(file: File, db: AppDB) {
  const zip = await JSZip.loadAsync(file)
  const decks: any[] = []
  await Promise.all(
    Object.entries(zip.files).map(async ([name, f]) => {
      if (name.startsWith('decks/') && name.endsWith('.json')) {
        decks.push(JSON.parse(await f.async('string')))
      }
    })
  )
  await writeAll(decks, db)
}
