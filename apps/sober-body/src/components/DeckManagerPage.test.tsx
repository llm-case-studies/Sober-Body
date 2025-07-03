import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
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


beforeEach(() => {
  localStorage.clear()
})
afterEach(() => cleanup())

describe('DeckManagerPage play button', () => {
  it('navigates with deck id from visible row', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DeckManagerPage />
      </MemoryRouter>
    )

    await screen.findByRole('option', { name: 'en' })
    await user.selectOptions(await screen.findByLabelText(/language/i, { selector: 'select' }), 'en')
    const links = await screen.findAllByRole('link', { name: 'Start drill' })
    expect(links[1].getAttribute('href')).toBe('/coach/deck/b')
  })

  it('navigates with deck id from third row', async () => {
    render(
      <MemoryRouter>
        <DeckManagerPage />
      </MemoryRouter>
    )

    const links = await screen.findAllByRole('link', { name: 'Start drill' })
    expect(links).toHaveLength(3)
    expect(links[2].getAttribute('href')).toBe('/coach/deck/b')
  })
})

describe('DeckManagerPage filters', () => {
  it('category + language filter reduces visible decks', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DeckManagerPage />
      </MemoryRouter>
    )

    await screen.findByRole('option', { name: 'pt-BR' })
    await user.selectOptions(await screen.findByLabelText(/language/i, { selector: 'select' }), 'pt-BR')
    await user.selectOptions(screen.getByLabelText(/categories/i, { selector: 'select' }), 'hotel')

    const rows = await screen.findAllByRole('listitem')
    expect(rows).toHaveLength(1)
    expect(rows[0].textContent).toContain('A')
  })

  it('clearing filters shows all decks', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DeckManagerPage />
      </MemoryRouter>
    )

    await screen.findByRole('option', { name: 'pt-BR' })
    await user.selectOptions(await screen.findByLabelText(/language/i, { selector: 'select' }), 'pt-BR')
    await user.selectOptions(screen.getByLabelText(/categories/i, { selector: 'select' }), 'hotel')
    await user.deselectOptions(screen.getByLabelText(/categories/i, { selector: 'select' }), 'hotel')
    await user.selectOptions(screen.getByLabelText(/language/i, { selector: 'select' }), 'all')

    const rows = await screen.findAllByRole('listitem')
    expect(rows).toHaveLength(3)
  })
})
