import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import DeckManagerPage from './DeckManagerPage'

const mockDecks = [
  { id: 'a', title: 'A', lang: 'pt-BR', lines: ['1'], tags: ['cat:hotel'], updated: 2 },
  { id: 'b', title: 'B', lang: 'en', lines: ['2'], tags: ['cat:groceries'], updated: 1 },
  { id: 'c', title: 'C', lang: 'en', lines: ['3'], tags: ['cat:hotel'], updated: 3 },
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

afterEach(() => cleanup())

describe('DeckManagerPage play button', () => {
  it('navigates with deck id from visible row', async () => {
    const user = userEvent.setup()
    render(<DeckManagerPage />)

    await screen.findByRole('option', { name: 'en' })
    await user.selectOptions(await screen.findByLabelText(/language/i, { selector: 'select' }), 'en')
    const buttons = await screen.findAllByRole('button', { name: 'Start drill' })
    fireEvent.click(buttons[1])
    expect(navigate).toHaveBeenCalledWith('/coach?deck=b')
  })
})

describe('DeckManagerPage filters', () => {
  it('category + language filter reduces visible decks', async () => {
    const user = userEvent.setup()
    render(<DeckManagerPage />)

    await screen.findByRole('option', { name: 'pt-BR' })
    await user.selectOptions(await screen.findByLabelText(/language/i, { selector: 'select' }), 'pt-BR')
    await user.selectOptions(screen.getByLabelText(/categories/i, { selector: 'select' }), 'hotel')

    const rows = await screen.findAllByRole('listitem')
    expect(rows).toHaveLength(1)
    expect(rows[0].textContent).toContain('A')
  })

  it('clearing filters shows all decks', async () => {
    const user = userEvent.setup()
    render(<DeckManagerPage />)

    await screen.findByRole('option', { name: 'pt-BR' })
    await user.selectOptions(await screen.findByLabelText(/language/i, { selector: 'select' }), 'pt-BR')
    await user.selectOptions(screen.getByLabelText(/categories/i, { selector: 'select' }), 'hotel')
    await user.deselectOptions(screen.getByLabelText(/categories/i, { selector: 'select' }), 'hotel')
    await user.selectOptions(screen.getByLabelText(/language/i, { selector: 'select' }), 'all')

    const rows = await screen.findAllByRole('listitem')
    expect(rows).toHaveLength(3)
  })
})
