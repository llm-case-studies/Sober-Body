import { describe, it, expect } from 'vitest'
import { getCategories } from '../get-categories'
import type { Deck } from '../deck-types'

describe('category filtering', () => {
  it('filters decks by selected category', () => {
    const decks: Deck[] = [
      { id: '1', title: 'Pharmacy', lang: 'en', lines: ['a'], tags: ['cat:pharmacy'] },
      { id: '2', title: 'Taxi', lang: 'en', lines: ['b'], tags: ['cat:taxi'] },
    ]
    const cats = getCategories(decks)
    expect(cats).toContain('cat:pharmacy')
    const visible = decks.filter(d => d.tags?.includes('cat:pharmacy'))
    expect(visible.length).toBe(1)
    expect(visible[0].title).toBe('Pharmacy')
  })
})
