import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import 'fake-indexeddb/auto'
import CoachPage from '../coach'
import { DeckProvider, useDecks } from '../../features/games/deck-context'
import { SettingsProvider } from '../../features/core/settings-context'

const decks = [
  { id: 'abc', title: 'Test', lang: 'en', lines: ['x'], tags: [] as string[] }
]

vi.mock('../../features/games/deck-storage', () => ({
  loadDecks: vi.fn(async () => decks),
  saveDecks: vi.fn(),
}))

function ActiveDisplay() {
  const { activeDeck } = useDecks()
  return <div data-testid="active">{activeDeck}</div>
}

describe('CoachPage routing', () => {
  it('loads deck from param path', async () => {
    render(
      <MemoryRouter initialEntries={['/coach/deck/abc']}>
        <SettingsProvider>
          <DeckProvider>
            <Routes>
              <Route path="/coach/deck/:id" element={<><CoachPage /><ActiveDisplay /></>} />
            </Routes>
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByTestId('active').textContent).toBe('abc')
    })
  })

  it('skips warning once decks are ready', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <MemoryRouter initialEntries={['/coach/deck/abc']}>
        <SettingsProvider>
          <DeckProvider>
            <Routes>
              <Route path="/coach/deck/:id" element={<><CoachPage /><ActiveDisplay /></>} />
            </Routes>
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    )
    const nodes = await screen.findAllByTestId('active')
    expect(nodes[0].textContent).toBe('abc')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
