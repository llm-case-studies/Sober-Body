import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import DeckManager from '../src/components/DeckManager'
import { db, resetDB } from '../src/db'
import { MemoryRouter } from 'react-router-dom'

beforeEach(async () => {
  await db.delete()
  resetDB()
  await db.open()
  await db.decks.add({ id: 'g', title: 'Groceries', lang: 'en', updatedAt: 0 })
})

describe('Clear decks button', () => {
  it('refreshes list after Clear decks', async () => {
    console.log('▶ START: refreshes list after Clear decks');
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Groceries/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear decks/i }))
    await waitFor(() =>
      expect(screen.queryByText(/Groceries/)).not.toBeInTheDocument()
    )
    console.log('✔ END:   refreshes list after Clear decks');
  })
})

