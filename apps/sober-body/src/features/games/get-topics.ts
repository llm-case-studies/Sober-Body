import type { Deck } from './deck-types'

export function getTopics(decks: Deck[]): string[] {
  const set = new Set<string>()
  decks.forEach(d => d.tags?.forEach(t => {
    if (t.startsWith('topic:')) set.add(t)
  }))
  return Array.from(set).sort()
}
