import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import DeckManager from '../src/components/DeckManager'

const deck = { id: 'abc123', title: 'Deck', lang: 'en', updatedAt: 0 }
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => [deck] }))
vi.mock('../src/db', () => ({ db: {} }))

describe('Drill link', () => {
  it('points to coach page', () => {
    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: /drill deck/i })
    expect(link.getAttribute('href')).toBe('/coach/abc123')
  })
})
