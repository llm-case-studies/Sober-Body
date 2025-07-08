import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import JSZip from 'jszip'
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
    const zip = new JSZip()
    zip.file('decks/a.json', JSON.stringify({ id: 'a', title: 'A', lang: 'en', lines: ['x'] }))
    zip.file('decks/b.json', JSON.stringify({ id: 'b', title: 'B', lang: 'en', lines: ['y'] }))
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
      expect(await db.decks.count()).toBe(2)
    })
    await screen.findByText('A')
    await screen.findByText('B')
  })
})
