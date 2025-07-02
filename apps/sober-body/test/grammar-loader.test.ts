import { describe, it, expect } from 'vitest'
import { getBriefForDeck } from '../src/grammar-loader'

describe('getBriefForDeck', () => {
  it('links refs for deck', () => {
    const brief = getBriefForDeck('drill-visita-museu-pt-BR')
    expect(brief?.linkedRefs).toHaveLength(3)
  })
})
