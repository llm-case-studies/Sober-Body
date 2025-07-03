import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import DrillLink from './DrillLink'

const deck = { id: 'x', title: 'X', lang: 'en', lines: [], tags: [] as string[] }

describe('DrillLink', () => {
  it('links to deck path', () => {
    render(
      <MemoryRouter>
        <DrillLink deck={deck} />
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: 'Start drill' })
    expect(link.getAttribute('href')).toBe('/coach/deck/x')
  })
})
