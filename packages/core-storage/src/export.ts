import JSZip from 'jszip'
import { deckDB } from './db'

export async function exportDeck(deckId: string, asZip = false) {
  const deck = await deckDB.decks.get(deckId)
  const cards = await deckDB.cards.where('deckId').equals(deckId).toArray()
  if (!deck) throw new Error('Deck not found')

  const json = JSON.stringify(
    { title: deck.name, lines: cards.map(c => [c.front, c.back]) },
    null,
    2
  )

  if (asZip) {
    const zip = new JSZip()
    zip.file(`${deck.name}.json`, json)
    return zip.generateAsync({ type: 'blob' })
  }
  return new Blob([json], { type: 'application/json' })
}
