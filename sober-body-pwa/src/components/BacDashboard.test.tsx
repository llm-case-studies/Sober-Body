import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { DrinkLogProvider, useDrinkLog } from '../features/core/drink-context'
import DrinkButtons from './DrinkButtons'
import { estimateBAC } from '../features/core/bac'

function LogLength() {
  const { log } = useDrinkLog()
  return <div data-testid="length">{log.length}</div>
}

function BacValue() {
  const { log } = useDrinkLog()
  const bac = estimateBAC(log, { weightKg: 70, sex: 'm' })
  return <div data-testid="bac">{bac}</div>
}

describe('BacDashboard interactions', () => {
  afterEach(() => cleanup())
  it('clicking Beer increases log length', () => {
    render(
      <DrinkLogProvider>
        <DrinkButtons />
        <LogLength />
      </DrinkLogProvider>
    )
    expect(screen.getByTestId('length').textContent).toBe('0')
    fireEvent.click(screen.getByRole('button', { name: /beer/i }))
    expect(screen.getByTestId('length').textContent).toBe('1')
  })

  it('BAC > 0 after adding Shot', () => {
    render(
      <DrinkLogProvider>
        <DrinkButtons />
        <BacValue />
      </DrinkLogProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /shot/i }))
    const value = Number(screen.getByTestId('bac').textContent)
    expect(value).toBeGreaterThan(0)
  })
})
