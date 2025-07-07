import React, { useContext, useEffect, useRef, useState } from 'react'
import { db } from '../db'
import type { Deck } from '../../sober-body/src/features/games/deck-types'
import { DeckContext } from '../../sober-body/src/features/games/deck-context'

export interface DeckValue {
  decks: Deck[]
  activeDeck: string | null
  setActiveDeck: (id: string) => void
}


export function DeckProvider({ children }: { children: React.ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [activeDeck, setActiveDeck] = useState<string | null>(null)
  const loaded = useRef(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      const rows = await db.decks.toArray()
      const arr: Deck[] = []
      for (const r of rows) {
        const cards = await db.cards.where('deckId').equals(r.id).toArray()
        arr.push({
          id: r.id,
          title: r.title,
          lang: r.lang,
          lines: cards.map(c => c.text),
          tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
          updated: r.updatedAt,
        })
      }
      if (alive) {
        setDecks(arr)
        loaded.current = true
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

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
