import Dexie, { type Table } from 'dexie'

export interface Deck {
  id: string
  title: string
  lang: string
  category?: string
  folderId?: string
  tags?: string
  grammarBrief?: string
  vocabulary?: { word: string; definition: string }[];
  complexityLevel?: string;
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: number
  type: 'custom' | 'auto'
  autoRule?: {
    field: 'lang' | 'category' | 'date' | 'tags'
    value?: string
    pattern?: string
  }
  diskPath?: string // For sync with file system
  color?: string // Visual organization
  order?: number // Manual ordering
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
    folders: '&id,name,parentId,createdAt,type',
    ui: '&id',
    ...schema,
  })
  return db as AppDB
}
