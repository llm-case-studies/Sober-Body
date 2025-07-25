import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { loadDecks, saveDecks } from './deck-storage'
import type { Deck } from './deck-types'

export interface DeckValue {
  decks: Deck[]
  activeDeck: string | null
  setActiveDeck: (id: string) => void
}

export const DeckContext = createContext<DeckValue | undefined>(undefined)

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

export function useDeck(id: string) {
  const { decks } = useDecks()
  return decks.find(d => d.id === id)
}
