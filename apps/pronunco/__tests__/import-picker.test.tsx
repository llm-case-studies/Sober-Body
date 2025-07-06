import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import DeckManager from '../src/components/DeckManager'
import { MemoryRouter } from 'react-router-dom'

const importZip = vi.fn(async () => {})
const importFolder = vi.fn(async () => {})
const saveLastDir = vi.fn(async () => {})
const getLastDir = vi.fn(async () => undefined)

vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => [] }))
vi.mock('../../packages/core-storage/src/import-decks', () => ({
  importDeckZip: (...args: any[]) => importZip(...args),
  importDeckFolder: (...args: any[]) => importFolder(...args)
}))
vi.mock('../src/db', () => ({
  db: { decks: { toArray: vi.fn() } }
}))
vi.mock('../../packages/core-storage/src/ui-store', () => ({
  saveLastDir: (...args: any[]) => saveLastDir(...args),
  getLastDir: (...args: any[]) => getLastDir(...args)
}))

function setup() {
  render(
    <MemoryRouter>
      <DeckManager />
    </MemoryRouter>
  )
}

beforeEach(() => {
  importZip.mockClear();
  importFolder.mockClear();
  saveLastDir.mockClear();
  getLastDir.mockClear();
  delete (window as any).showOpenFilePicker
})

describe('import pickers', () => {
  it('falls back to hidden input', async () => {
    setup()
    const user = userEvent.setup()
    const file = new File(['x'], 'd.zip', { type: 'application/zip' })
    await user.click(screen.getByText(/import zip/i))
    const input = screen.getByTestId('zipInput') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    expect(importZip).toHaveBeenCalledWith(file, expect.anything())
    expect(input.value).toBe('')
  })

  it('uses showOpenFilePicker when available', async () => {
    ;(window as any).showOpenFilePicker = vi.fn().mockResolvedValue([
      { getFile: vi.fn().mockResolvedValue(new File(['x'], 'd.zip')) }
    ])
    const order: string[] = []
    saveLastDir.mockImplementation(async () => {
      order.push('save')
    })
    importZip.mockImplementation(async () => {
      order.push('import')
    })
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText(/import zip/i))
    expect(window.showOpenFilePicker).toHaveBeenCalled()
    expect(importZip).toHaveBeenCalled()
    expect(saveLastDir).toHaveBeenCalled()
    expect(order).toEqual(['save', 'import'])
  })
})
