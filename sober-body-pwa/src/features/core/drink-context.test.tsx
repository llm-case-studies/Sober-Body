import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { DrinkLogProvider, useDrinkLog } from './drink-context'
import { type DrinkEvent } from './bac'
import { loadDrinks } from './storage'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

function AddButton() {
  const { addDrink } = useDrinkLog()
  const drink: DrinkEvent = { volumeMl: 100, abv: 0.05, date: new Date() }
  return <button onClick={() => addDrink(drink)}>Add</button>
}

function LogLength() {
  const { drinks } = useDrinkLog()
  return <div data-testid="length">{drinks.length}</div>
}

describe('DrinkLogProvider persistence', () => {
  beforeEach(async () => {
    await clearDB()
  })
  afterEach(() => cleanup())

  it('restores drinks after remount', async () => {
    const first = render(
      <DrinkLogProvider>
        <AddButton />
        <LogLength />
      </DrinkLogProvider>
    )
    // allow provider to load from storage
    await new Promise(r => setTimeout(r, 20))
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByTestId('length').textContent).toBe('1')
    // allow save effect to persist to IndexedDB
    await waitFor(async () => {
      const stored = await loadDrinks()
      expect(stored.length).toBe(1)
    })

    first.unmount()

    render(
      <DrinkLogProvider>
        <LogLength />
      </DrinkLogProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('length').textContent).toBe('1')
    })
  })
})
