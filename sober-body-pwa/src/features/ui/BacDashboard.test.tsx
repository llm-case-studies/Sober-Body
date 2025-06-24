import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BacDashboard from './BacDashboard'

describe('BacDashboard', () => {
  it('renders BAC and hours', () => {
    render(<BacDashboard />)
    expect(screen.getByTestId('bac')).toBeTruthy()
    expect(screen.getByTestId('hours')).toBeTruthy()
  })
})
