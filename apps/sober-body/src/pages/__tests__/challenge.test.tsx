import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import ChallengePage from '../challenge'
import { encodeChallenge } from '../../features/games/challenge'

describe('ChallengePage', () => {
  it('shows decoded text', () => {
    const p = encodeChallenge({ deckId: 'd', unit: 1, text: 'hello', ownerScore: 0 })
    render(
      <MemoryRouter initialEntries={[`/challenge/${p}`]}>
        <Routes>
          <Route path="/challenge/:payload" element={<ChallengePage />} />
        </Routes>
      </MemoryRouter>
    )
    const node = screen.getByText('hello')
    expect(node.textContent).toBe('hello')
  })
})
