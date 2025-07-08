import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import CoachPage from '../src/pages/CoachPage'
import { DeckContext } from '../../sober-body/src/features/games/deck-context'
import { SettingsProvider } from '../../sober-body/src/features/core/settings-context'
import { vi } from 'vitest'


const deck = { id: 'd1', title: 'D1', lang: 'en', lines: ['hello', 'bye'], tags: [], updated: 0 }

describe('CoachPage', () => {
  it('renders first prompt line', async () => {
    console.log('▶ START: renders first prompt line');
    render(
      <MemoryRouter initialEntries={['/coach/d1']}>
        <SettingsProvider>
          <DeckContext.Provider value={{ decks: [deck], activeDeck: deck.id, setActiveDeck: vi.fn() }}>
            <Routes>
              <Route path="/coach/:deckId" element={<CoachPage />} />
            </Routes>
          </DeckContext.Provider>
        </SettingsProvider>
      </MemoryRouter>
    )
    expect(document.body.innerHTML).toContain('hello')
    console.log('✔ END:   renders first prompt line');
  })
})
