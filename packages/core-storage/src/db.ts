import Dexie, { type Table } from 'dexie'

export interface Deck {
  id: string
  title: string
  lang: string
  category?: string
  tags?: string
  updatedAt: number
}

export interface AppDB extends Dexie {
  decks: Table<Deck, string>
}

export const createAppDB = (app: 'sober' | 'pronun'): AppDB => {
  const db = new Dexie(`${app}-v2`)
  db.version(1).stores({
    decks: '&id,title,lang,updatedAt'
  })
  return db as AppDB
}
