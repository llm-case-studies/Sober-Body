import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { loadDecks, seedPresetDecks } from '../deck-storage'
import { LANGS } from '../../../../../../packages/pronunciation-coach/src/langs'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('seedPresetDecks', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('seeds presets without duplication', async () => {
    await seedPresetDecks()
    const first = await loadDecks()
    // Verify we have preset decks (exact count may vary as we add languages)
    expect(first.length).toBeGreaterThan(0)
    await seedPresetDecks()
    const second = await loadDecks()
    // Verify no duplication occurs
    expect(second.length).toBe(first.length)
  })
})
