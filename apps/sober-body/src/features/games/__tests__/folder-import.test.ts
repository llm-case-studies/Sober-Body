import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import * as storage from '../deck-storage'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('importDeckFiles', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('calls saveDeck for each file', async () => {
    const spy = vi.fn().mockResolvedValue(undefined)
    const f1 = { name: 'a.json', text: async () => '{"id":"a","title":"A","lang":"en","lines":["x"]}' } as File
    const f2 = { name: 'b.json', text: async () => '{"id":"b","title":"B","lang":"en","lines":["y"]}' } as File
    await storage.importDeckFiles([f1, f2], spy)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
