import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

const deck = { id: '123', title: 'A', lang: 'en', updatedAt: 0 }
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => [deck] }))
vi.mock('../src/db', () => ({ db: {} }))

import DeckManager from '../src/components/DeckManager'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

describe('DeckManager drill button', () => {
  it('navigates to coach route', async () => {
    console.log('▶ START: navigates to coach route');
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DeckManager />
      </MemoryRouter>
    )
    const box = await screen.findByLabelText('Select A')
    await user.click(box)
    await user.click(screen.getByRole('button', { name: /drill/i }))
    expect(navigateMock).toHaveBeenCalledWith('/coach/123')
    console.log('✔ END:   navigates to coach route');
  })
})
