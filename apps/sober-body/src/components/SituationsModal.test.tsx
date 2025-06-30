import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import SituationsModal from './SituationsModal'
import { DeckProvider } from '../features/games/deck-context'

const decks = [
  { id: '1', title: 'Hotel', lang: 'en', lines: ['a'], tags: ['official', 'topic:hotel'] },
  { id: '2', title: 'Taxi', lang: 'en', lines: ['b'], tags: ['official', 'topic:taxi'] },
]

vi.mock('../features/games/deck-storage', () => ({
  loadDecks: vi.fn(async () => decks),
  saveDecks: vi.fn(),
}))

describe('SituationsModal topic filter', () => {
  beforeEach(() => {
    const div = document.createElement('div')
    div.id = 'portal-root'
    document.body.appendChild(div)
  })
  afterEach(() => {
    document.getElementById('portal-root')?.remove()
  })
  it('filters decks by selected topic', async () => {
    render(
      <DeckProvider>
        <SituationsModal open={true} onClose={() => {}} />
      </DeckProvider>
    )
    await screen.findByText('Hotel')
    fireEvent.click(screen.getByRole('button', { name: /hotel/i }))
    expect(screen.queryByText('Taxi')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /hotel/i }))
    expect(screen.getByText('Taxi')).toBeTruthy()
  })
})
