import Dexie, { Table } from 'dexie'

export interface Deck {
  id: string
  name: string
  cardCount: number
  importedAt: number
}
export interface Card {
  id: string
  deckId: string
  front: string
  back: string
}

class DeckDB extends Dexie {
  decks!: Table<Deck>
  cards!: Table<Card>
  constructor() {
    super('soberBodyDecks')
    this.version(1).stores({
      decks: 'id, name, importedAt',
      cards: 'id, deckId'
    })
  }
}
export const deckDB = new DeckDB()
