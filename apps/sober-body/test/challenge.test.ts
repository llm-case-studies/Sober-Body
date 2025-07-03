import { describe, it, expect } from 'vitest'
import { encodeChallenge, decodeChallenge } from '../src/features/games/challenge'

describe('challenge encode/decode', () => {
  it('round trips object', () => {
    const obj = { deckId: 'd', unit: 2, text: 'hi', ownerScore: 90 }
    const p = encodeChallenge(obj)
    const res = decodeChallenge(p)
    expect(res).toEqual(obj)
  })
})
