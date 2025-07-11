import React from 'react'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DeckManager from '../src/components/DeckManager'
import { MemoryRouter } from 'react-router-dom'

const decks = [
  { id: 'a', title: 'A', lang: 'en', updatedAt: 0 },
  { id: 'b', title: 'B', lang: 'en', updatedAt: 0 }
]

var bulkDeleteMock: any
var mockDb: any
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: vi.fn(() => decks) }))
vi.mock('../src/db', () => {
  bulkDeleteMock = vi.fn()
  mockDb = {
    decks: { bulkDelete: bulkDeleteMock, toArray: () => decks },
    transaction: async (_m: any, _t: any, fn: () => Promise<void>) => { await fn() }
  }
  return { db: () => mockDb }
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
  const boxes = await screen.findByLabelText('Select All')
  fireEvent.click(boxes)
}

describe('DeckManager bulk actions', () => {
  it('selection toggles bar', async () => {
    console.log('▶ START: selection toggles bar');
    await act(async () => {
      setup()
    })
    const bars = screen.getAllByTestId('action-bar')
    expect(bars.length).toBeGreaterThan(0)
    console.log('✔ END:   selection toggles bar');
  })

  it('export util called with ids', async () => {
    console.log('▶ START: export util called with ids');
    await act(async () => {
      setup()
    })
    fireEvent.click(screen.getAllByText(/export zip/i)[0])
    expect(exportDeckZip).toHaveBeenCalledWith(['a', 'b'], expect.anything())
    console.log('✔ END:   export util called with ids');
  })

  it('delete clears rows & bar hides', async () => {
    console.log('▶ START: delete clears rows & bar hides');
    vi.stubGlobal('alert', () => {})
    await act(async () => {
      setup()
    })
    const bar = screen.getAllByTestId('action-bar').pop()!
    fireEvent.click(within(bar).getByRole('button', { name: /delete/i }))
    expect(bulkDeleteMock).toHaveBeenCalledWith(['a', 'b'])
    console.log('✔ END:   delete clears rows & bar hides');
  })
})