import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { seedPresetDecks, loadDecks } from '../deck-storage'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('preset deck seeding', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('loads groceries and hotel presets', async () => {
    await seedPresetDecks()
    const decks = await loadDecks()
    expect(decks.some(d => d.id === 'preset-groceries-en')).toBe(true)
    expect(decks.some(d => d.tags?.includes('topic:hotel'))).toBe(true)
  })
})
