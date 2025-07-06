import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import JSZip from 'jszip'
import fs from 'node:fs/promises'
import path from 'node:path'
import { samplePresetDecks } from './utils'
import DeckManager from '../src/components/DeckManager'
import { db, resetDB } from '../src/db'
import { MemoryRouter } from 'react-router-dom'

beforeEach(async () => {
  await db.delete()
  resetDB()
  await db.open()
})

describe('DeckManager import', () => {
  it('imports decks from zip', async () => {
    const files = await samplePresetDecks()
    const zip = new JSZip()
    for (const f of files) {
      const content = await fs.readFile(f, 'utf8')
      zip.file(`decks/${path.basename(f)}`, content)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const file = new File([blob], 'decks.zip')

    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )
    const input = screen.getByLabelText(/import zip/i)
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(async () => {
      expect(await db.decks.count()).toBe(files.length)
    })
  })
})
