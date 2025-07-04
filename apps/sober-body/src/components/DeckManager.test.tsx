import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import DeckManager from './DeckManager'
import * as hooks from '../../../../packages/core-speech/src/hooks/useDecks'

const mockUseDecks = {
  decks: [
    { id: '1', name: 'A', cardCount: 2, importedAt: 0 }
  ],
  deleteDeck: vi.fn(),
  clearAllDecks: vi.fn()
}

vi.spyOn(hooks, 'useDecks').mockReturnValue(
  mockUseDecks as ReturnType<typeof hooks.useDecks>
)

describe('DeckManager', () => {
  it('renders deck list', () => {
    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )
    expect(screen.getByText('A')).toBeTruthy()
  })
})
