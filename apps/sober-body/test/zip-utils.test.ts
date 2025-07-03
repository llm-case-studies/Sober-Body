import { describe, it, expect } from 'vitest'
import { exportZip, importZip } from '../src/features/games/zip-utils'
import type { Deck } from '../src/features/games/deck-types'
import type { BriefDoc } from '../src/brief-storage'

describe('zip utils', () => {
  it('export and re-import decks and briefs', async () => {
    const decks: Deck[] = [{ id: 'x', title: 'X', lang: 'en', lines: ['a'], tags: [] }]
    const briefs: BriefDoc[] = [{ deckId: 'x', grammar: { verb_tenses: [], prepositions: [] }, notes: 'n', updatedAt: 0 }]
    const blob = await exportZip(decks, briefs)
    const res = await importZip(blob)
    expect(res.decks[0].id).toBe('x')
    expect(res.briefs[0].deckId).toBe('x')
  })
})
