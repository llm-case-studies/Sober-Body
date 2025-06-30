import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { loadDecks, saveDeck, exportDeck, importDeck } from '../deck-storage'

function makeDeck(id: string) {
  return { id, title: 'Test', lang: 'en', lines: ['a'], tags: [] as string[] }
}

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('deck round trip', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('import duplicates with new id', async () => {
    const d = makeDeck('a')
    await saveDeck(d)
    const json = exportDeck(d)
    const imported = await importDeck(json)
    const decks = await loadDecks()
    expect(decks.length).toBe(2)
    expect(imported.id).not.toBe(d.id)
  })

  it('editing lines persists', async () => {
    const d = makeDeck('b')
    await saveDeck(d)
    await saveDeck({ ...d, lines: ['b'] })
    const decks = await loadDecks()
    expect(decks.find(x => x.id === 'b')?.lines[0]).toBe('b')
  })
})
