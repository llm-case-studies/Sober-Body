import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'
import { createAppDB } from '../src/db'
import { saveLastDir, getLastDir } from '../src/ui-store'

describe('ui-store', () => {
  it('stores and retrieves last handle', async () => {
    const db = createAppDB('pronun')
    const handle = { kind: 'file' } as any
    await saveLastDir(db, handle)
    const out = await getLastDir(db)
    expect(out).toStrictEqual(handle)
  })
})
