import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import CoachPage from '../coach'

describe('CoachPage link', () => {
  it('links to PronunCo', () => {
    render(
      <MemoryRouter>
        <CoachPage />
      </MemoryRouter>
    )
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/pc/coach')
  })
})
