import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { loadDrinks, saveDrinks } from './storage'
import { type DrinkEvent } from './bac'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('storage helpers', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('addDrink persists value', async () => {
    const drink: DrinkEvent = { volumeMl: 100, abv: 0.05, date: new Date() }
    await saveDrinks([drink])
    const stored = await loadDrinks()
    expect(stored).toEqual([drink])
  })

  it('loadDrinks returns previous array', async () => {
    const arr: DrinkEvent[] = [
      { volumeMl: 50, abv: 0.1, date: new Date() }
    ]
    await saveDrinks(arr)
    const loaded = await loadDrinks()
    expect(loaded).toEqual(arr)
  })
})
