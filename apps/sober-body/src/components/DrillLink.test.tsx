import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DrillLink from './DrillLink'

const deck = { id: 'x', title: 'X', lang: 'en', lines: [], tags: [] as string[] }

describe('DrillLink', () => {
  it('opens new tab', () => {
    const open = vi.fn()
    vi.stubGlobal('window', { ...window, open })
    render(<DrillLink deck={deck} />)
    const btn = screen.getByRole('button', { name: 'Start drill' })
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(open).toHaveBeenCalledWith('/pc/coach/x', '_blank')
  })
})
