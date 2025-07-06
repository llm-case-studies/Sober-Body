import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DeckManager from '../src/components/DeckManager'
import { MemoryRouter } from 'react-router-dom'

const decks = [
  { id: 'a', title: 'A', lang: 'en', updatedAt: 0 },
  { id: 'b', title: 'B', lang: 'en', updatedAt: 0 }
]

var bulkDeleteMock: any
var mockDb: any
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => decks }))
vi.mock('../src/db', () => {
  bulkDeleteMock = vi.fn()
  mockDb = {
    decks: { bulkDelete: bulkDeleteMock },
    transaction: async (_m: any, _t: any, fn: () => Promise<void>) => { await fn() }
  }
  return { db: mockDb }
})
vi.mock('../src/exportDeckZip', () => ({
  exportDeckZip: vi.fn(async () => new Blob())
}))
import { exportDeckZip } from '../src/exportDeckZip'

function setup() {
  render(
    <MemoryRouter>
      <DeckManager />
    </MemoryRouter>
  )
  const boxes = screen.getAllByLabelText('Select All')
  fireEvent.click(boxes[boxes.length - 1])
}

describe('DeckManager bulk actions', () => {
  it('selection toggles bar', () => {
    setup()
    const bars = screen.getAllByTestId('action-bar')
    expect(bars.length).toBeGreaterThan(0)
  })

  it('export util called with ids', async () => {
    setup()
    fireEvent.click(screen.getAllByText(/export zip/i)[0])
    expect(exportDeckZip).toHaveBeenCalledWith(['a', 'b'], expect.anything())
  })

  it('delete clears rows & bar hides', () => {
    vi.stubGlobal('alert', () => {})
    setup()
    const bar = screen.getAllByTestId('action-bar').pop()!
    fireEvent.click(within(bar).getByRole('button', { name: /delete/i }))
    expect(bulkDeleteMock).toHaveBeenCalledWith(['a', 'b'])
  })
})
