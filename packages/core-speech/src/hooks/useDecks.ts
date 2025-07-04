import { useState, useEffect } from 'react'
import { liveQuery } from 'dexie'
import { deckDB, deleteDeck, clearAllDecks, type Deck } from '../db/decks'

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])

  useEffect(() => {
    const sub = liveQuery(() => deckDB.decks.toArray()).subscribe({
      next: setDecks
    })
    return () => sub.unsubscribe()
  }, [])

  return {
    decks,
    deleteDeck,
    clearAllDecks
  }
}
