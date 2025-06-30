import { describe, it, expect } from 'vitest'
import { getLanguages } from '../get-languages'
import type { Deck } from '../deck-types'

const decks: Deck[] = [
  { id: '1', title: 'Taxi FR', lang: 'fr-FR', lines: ['a'], tags: ['cat:hotel'] },
  { id: '2', title: 'Taxi EN', lang: 'en-US', lines: ['b'], tags: ['cat:hotel'] },
  { id: '3', title: 'Taxi PT', lang: 'pt-BR', lines: ['c'], tags: ['cat:groceries'] },
]

describe('language filtering', () => {
  it('filters by category and language', () => {
    const langs = getLanguages(decks)
    expect(langs).toContain('fr-FR')
    const visible = decks.filter(d =>
      d.tags?.includes('cat:hotel') && d.lang === 'fr-FR'
    )
    expect(visible.length).toBe(1)
    expect(visible[0].title).toBe('Taxi FR')
  })
})
