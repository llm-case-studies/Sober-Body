import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DrinkButtons from './DrinkButtons'

describe('DrinkButtons', () => {
  it('renders all drink buttons', () => {
    render(<DrinkButtons />)
    expect(screen.getByRole('button', { name: /beer/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /wine/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /shot/i })).toBeTruthy()
  })
})
