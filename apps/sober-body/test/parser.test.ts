import { describe, it, expect } from 'vitest'
import { splitUnits } from '../src/features/games/parser'

describe('splitUnits', () => {
  it('splits by phrase commas', () => {
    expect(splitUnits('a, b; c — d', 'phrase')).toEqual(['a', 'b', 'c', 'd'])
  })

  it('falls back to sentence when no commas', () => {
    expect(splitUnits('Hello world.', 'phrase')).toEqual(['Hello world.'])
  })

  it('paragraph split by blank lines', () => {
    const t = 'Para 1.\nLine2.\n\nPara 2.\n\nPara 3.'
    expect(splitUnits(t, 'paragraph')).toHaveLength(3)
  })
})
