import Dexie, { type Table } from 'dexie'

export interface Deck {
  id: string
  title: string
  lang: string
  category?: string
  tags?: string
  updatedAt: number
}

export interface Card {
  id: string
  deckId: string
  text: string
}

export interface AppDB extends Dexie {
  decks: Table<Deck, string>
  cards: Table<Card, string>
}

export const createAppDB = (app: 'sober' | 'pronun'): AppDB => {
  const db = new Dexie(`${app}-v2`)
  db.version(1).stores({
    decks: '&id,title,lang,category,updatedAt',
    cards: 'id,deckId'
  })
  return db as AppDB
}
