import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'
import JSZip from 'jszip'
import { createAppDB } from '../src/db'
import { importDeckZip } from '../src/import-decks'

describe('importDeckZip', () => {
  it('inserts decks from a zip', async () => {
    const db = createAppDB('pronun')
    const zip = new JSZip()
    zip.file('decks/a.json', JSON.stringify({ id: 'a', title: 'A', lang: 'en', lines: ['x'] }))
    zip.file('decks/b.json', JSON.stringify({ id: 'b', title: 'B', lang: 'en', lines: ['y'] }))
    const blob = await zip.generateAsync({ type: 'blob' })
    const file = new File([blob], 'decks.zip')
    await importDeckZip(file, db)
    const count = await db.decks.count()
    expect(count).toBe(2)
  })
})
