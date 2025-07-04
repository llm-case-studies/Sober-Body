import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { deckDB, deleteDeck, clearAllDecks } from './decks'
import { exportDB, importInto } from 'dexie-export-import'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('deckDB CRUD', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('deleteDeck removes deck and cards', async () => {
    await deckDB.decks.add({ id: '1', name: 'test', cardCount: 1, importedAt: 0 })
    await deckDB.cards.add({ id: 'c1', deckId: '1', front: 'f', back: 'b' })
    await deleteDeck('1')
    expect(await deckDB.decks.get('1')).toBeUndefined()
    const cards = await deckDB.cards.where('deckId').equals('1').toArray()
    expect(cards.length).toBe(0)
  })

  it('clearAllDecks clears tables', async () => {
    await deckDB.decks.add({ id: '1', name: 't', cardCount: 0, importedAt: 0 })
    await deckDB.cards.add({ id: 'c1', deckId: '1', front: 'f', back: 'b' })
    await clearAllDecks()
    expect((await deckDB.decks.toArray()).length).toBe(0)
    expect((await deckDB.cards.toArray()).length).toBe(0)
  })

  it('export/import roundtrip', async () => {
    await deckDB.decks.add({ id: '1', name: 't', cardCount: 0, importedAt: 0 })
    const blob = await exportDB(deckDB)
    await clearDB()
    await importInto(deckDB, blob)
    const decks = await deckDB.decks.toArray()
    expect(decks.length).toBe(1)
  })
})
