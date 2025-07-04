import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { deckDB, type Deck } from './db'

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  useEffect(() => {
    const sub = liveQuery(() => deckDB.decks.toArray()).subscribe(setDecks)
    return () => sub.unsubscribe()
  }, [])
  return { decks }
}
