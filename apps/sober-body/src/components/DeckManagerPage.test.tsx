import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import 'fake-indexeddb/auto'
import DeckManagerPage from './DeckManagerPage'

const mockDecks = [
  { id: 'a', title: 'A', lang: 'pt-BR', lines: ['1'], tags: [], updated: 2 },
  { id: 'b', title: 'B', lang: 'en', lines: ['2'], tags: [], updated: 1 },
  { id: 'c', title: 'C', lang: 'en', lines: ['3'], tags: [], updated: 3 },
]

vi.mock('../features/games/deck-storage', () => ({
  loadDecks: vi.fn(async () => mockDecks),
  saveDeck: vi.fn(),
  deleteDeck: vi.fn(),
  exportDeck: vi.fn(),
  importDeck: vi.fn(),
  importDeckFiles: vi.fn(),
}))

const navigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

describe('DeckManagerPage play button', () => {
  it('navigates with deck id from visible row', async () => {
    render(<DeckManagerPage />)

    fireEvent.click(await screen.findByRole('button', { name: 'en' }))
    const buttons = await screen.findAllByRole('button', { name: 'Start drill' })
    fireEvent.click(buttons[1])
    expect(navigate).toHaveBeenCalledWith('/coach?deck=b')
  })
})
