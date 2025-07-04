import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'
import { createAppDB } from '../src/db'

describe('createAppDB', () => {
  it('adds and counts decks', async () => {
    const db = createAppDB('sober')
    expect(db.decks).toBeDefined()
    await db.decks.add({ id: '1', title: 't', lang: 'en', updatedAt: 0 })
    const count = await db.decks.count()
    expect(count).toBe(1)
  })
})
