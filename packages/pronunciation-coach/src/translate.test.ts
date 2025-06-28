import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { translate } from './translate'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('translate util', () => {
  beforeEach(async () => {
    await clearDB()
    vi.stubEnv('VITE_TRANSLATOR_KEY', 'x')
    vi.stubEnv('VITE_TRANSLATOR_REGION', 'y')
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => [{ translations: [{ text: 'hola' }] }]
    })) as unknown as typeof fetch)
  })

  it('hits cache on second call', async () => {
    const first = await translate('hello', 'es')
    expect(first).toBe('hola')
    expect(fetch).toHaveBeenCalledTimes(1)
    const second = await translate('hello', 'es')
    expect(second).toBe('hola')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
