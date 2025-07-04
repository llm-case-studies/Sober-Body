import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { importDeckFile } from './import'
import { exportDeck } from './export'
import { deckDB } from './db'

const jsonBlob = JSON.stringify({ title: 'demo', lines: [['a', 'b']] })

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('import-export roundtrip', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('import then export round-trip', async () => {
    const deckId = await importDeckFile(new File([jsonBlob], 'demo.json'))
    expect(await deckDB.decks.count()).toBe(1)
    const zip = await exportDeck(deckId, true)
    expect((zip as Blob).size).toBeGreaterThan(100)
  })
})
