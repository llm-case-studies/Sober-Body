import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import DeckManager from '../src/components/DeckManager'
import { db, resetDB } from '../src/db'
import { MemoryRouter } from 'react-router-dom'
import * as exportMod from '../src/exportDeckZip'

beforeEach(async () => {
  await db.delete()
  resetDB()
  await db.open()
  await db.decks.bulkAdd([
    { id: 'a', title: 'A', lang: 'en', updatedAt: 0 },
    { id: 'b', title: 'B', lang: 'en', updatedAt: 0 },
    { id: 'c', title: 'C', lang: 'en', updatedAt: 0 }
  ])
})

describe('DeckManager bulk actions', () => {
  it('export and delete selected decks', async () => {
    console.log('▶ START: export and delete selected decks');
    vi.spyOn(exportMod, 'exportDeckZip').mockResolvedValue(new Blob())

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )

    await user.click(await screen.findByLabelText('Select A'))
    await user.click(await screen.findByLabelText('Select B'))

    await user.click(screen.getByText(/export zip/i))
    expect(exportMod.exportDeckZip).toHaveBeenCalledWith(['a', 'b'], db)

    await user.click(screen.getByText(/delete/i))
    await screen.findByText('C')
    expect(await db.decks.count()).toBe(1)
    console.log('✔ END:   export and delete selected decks');
  })
})
