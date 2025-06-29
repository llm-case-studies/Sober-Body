import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Deck, loadDecks, saveDecks } from './deck-storage'

export interface DeckValue {
  decks: Deck[]
  activeDeck: string | null
  setActiveDeck: (id: string) => void
}

const DeckContext = createContext<DeckValue | undefined>(undefined)

export function DeckProvider({ children }: { children: React.ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [activeDeck, setActiveDeck] = useState<string | null>(null)
  const loaded = useRef(false)
  useEffect(() => {
    loadDecks().then(d => {
      setDecks(d)
      loaded.current = true
    })
  }, [])
  useEffect(() => {
    if (loaded.current) saveDecks(decks)
  }, [decks])
  return (
    <DeckContext.Provider value={{ decks, activeDeck, setActiveDeck }}>
      {children}
    </DeckContext.Provider>
  )
}

export function useDecks() {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error('useDecks must be used within DeckProvider')
  return ctx
}
