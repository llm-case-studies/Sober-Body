import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import CoachPage from '../src/pages/CoachPage'
import { DeckProvider } from '../src/features/deck-context'
import { SettingsProvider } from '../../sober-body/src/features/core/settings-context'
import { db, resetDB } from '../src/db'

beforeEach(async () => {
  await db.delete()
  resetDB()
  await db.open()
  await db.decks.add({ id: 'd1', title: 'D1', lang: 'en', updatedAt: 0 })
  await db.cards.bulkAdd([
    { id: 'c1', deckId: 'd1', text: 'hello' },
    { id: 'c2', deckId: 'd1', text: 'bye' },
  ])
})

describe('CoachPage', () => {
  it('renders first prompt line', async () => {
    render(
      <MemoryRouter initialEntries={['/coach/d1']}>
        <SettingsProvider>
          <DeckProvider>
            <Routes>
              <Route path="/coach/:deckId" element={<CoachPage />} />
            </Routes>
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    )
    expect(await screen.findByText('hello')).toBeInTheDocument()
  })
})
