import type { Deck } from './deck-types'

export function isSignedOfficial(deck: Deck): boolean {
  return deck.tags?.includes('official') ?? false
}
