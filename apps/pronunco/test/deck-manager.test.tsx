import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import path from 'node:path'
import fs from 'node:fs/promises'
import JSZip from 'jszip'
import { importDeckZip } from '../../../packages/core-storage/src/import-decks'
import { db, resetDB } from '../src/db'

beforeEach(async () => {
  await db.delete()
  resetDB()
  await db.open()
})

describe('DeckManager import', () => {
  it('imports decks from zip', async () => {
    const presetDir = path.resolve(__dirname, '../../sober-body/public/presets')
    const [first, second] = (await fs.readdir(presetDir))
      .filter(f => f.endsWith('.json'))
      .slice(0, 2)

    const zip = new JSZip()
    zip.file(
      `decks/${first}`,
      await fs.readFile(path.join(presetDir, first), 'utf8')
    )
    zip.file(
      `decks/${second}`,
      await fs.readFile(path.join(presetDir, second), 'utf8')
    )
    const file = new File(
      [await zip.generateAsync({ type: 'uint8array' })],
      'preset.zip',
      { type: 'application/zip' }
    )

    await importDeckZip(file, db)
    expect(await db.decks.count()).toBe(2)
  })
})
