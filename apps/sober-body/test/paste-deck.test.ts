import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { loadDecks, saveDeck } from '../src/features/games/deck-storage'
import type { Deck } from '../src/features/games/deck-types'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('paste deck', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('creates deck from pasted text', async () => {
    const text = 'line one\nline two'
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    const deck: Deck = {
      id: crypto.randomUUID(),
      title: 'Paste',
      lang: 'en',
      lines,
      tags: [],
      updated: Date.now(),
    }
    await saveDeck(deck)
    const decks = await loadDecks()
    expect(decks[0].lines.length).toBe(2)
  })
})
