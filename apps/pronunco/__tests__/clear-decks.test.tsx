import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

let clearMock: any
vi.mock('../src/db', () => {
  clearMock = vi.fn()
  return { clearDecks: clearMock, db: {} }
})
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => [{ id: 'g', title: 'Groceries', lang: 'en', updatedAt: 0 }] }))
import DeckManager from '../src/components/DeckManager'
import { MemoryRouter } from 'react-router-dom'

describe('Clear decks button', () => {
  it('refreshes list after Clear decks', async () => {
    console.log('▶ START: refreshes list after Clear decks');
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )

    await user.click(await screen.findByRole('button', { name: /clear decks/i }))
    expect(clearMock).toHaveBeenCalled()
    console.log('✔ END:   refreshes list after Clear decks');
  })
})

