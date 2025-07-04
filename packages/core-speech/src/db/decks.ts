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

export interface DeckSource {
  id: string
  deckId: string
  fileName: string
  fileHandle?: FileSystemFileHandle
  lastModified: number
}

class DeckDB extends Dexie {
  decks!: Table<Deck>
  cards!: Table<Card>
  sources!: Table<DeckSource>

  constructor() {
    super('soberBodyDecks')
    this.version(1).stores({
      decks: 'id, name, importedAt',
      cards: 'id, deckId, front, back',
      sources: 'id, deckId, fileName'
    })
  }
}

export const deckDB = new DeckDB()

export async function deleteDeck(deckId: string) {
  return deckDB.transaction('rw', deckDB.cards, deckDB.decks, async () => {
    await deckDB.cards.where('deckId').equals(deckId).delete()
    await deckDB.decks.delete(deckId)
    await deckDB.sources.where('deckId').equals(deckId).delete()
  })
}

export async function clearAllDecks() {
  return deckDB.transaction(
    'rw',
    deckDB.cards,
    deckDB.decks,
    deckDB.sources,
    () =>
      Promise.all([
        deckDB.cards.clear(),
        deckDB.decks.clear(),
        deckDB.sources.clear()
      ])
  )
}
