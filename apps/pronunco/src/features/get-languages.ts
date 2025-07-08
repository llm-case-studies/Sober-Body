export function getLanguages(decks: import('./deck-types').Deck[]): string[] {
  const set = new Set<string>()
  decks.forEach(d => set.add(d.lang))
  return Array.from(set).sort()
}
