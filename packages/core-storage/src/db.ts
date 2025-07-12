import Dexie, { type Table } from 'dexie'

export interface Deck {
  id: string
  title: string
  lang: string
  category?: string
  folderId?: string
  tags?: string
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: number
}

export interface Card {
  id: string
  deckId: string
  text: string
}

export interface AppDB extends Dexie {
  decks: Table<Deck, string>
  cards: Table<Card, string>
  folders: Table<Folder, string>
  ui: Table<any, string>
  challenges: Table<any, string>
  friend_scores: Table<any, string>
}

export const createAppDB = (app: 'sober' | 'pronun', schema: { [key: string]: string } = {}): AppDB => {
  const db = new Dexie(`${app}-v2`)
  db.version(1).stores({
    decks: '&id,title,lang,category,folderId,updatedAt',
    cards: 'id,deckId',
    folders: '&id,name,parentId,createdAt',
    ui: '&id',
    ...schema,
  })
  return db as AppDB
}
