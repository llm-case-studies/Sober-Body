import JSZip from 'jszip'
import { deckDB } from './db'

export async function importDeckFile(file: File) {
  const deckId = crypto.randomUUID()
  let deckJson: any

  if (file.name.endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file)
    const first = Object.keys(zip.files)[0]
    deckJson = JSON.parse(await zip.files[first].async('string'))
  } else {
    deckJson = JSON.parse(await file.text())
  }

  const { title: name, lines: cardsRaw } = deckJson
  const cards = cardsRaw.map((c: any, i: number) => ({
    id: `${deckId}-${i}`,
    deckId,
    front: c.front ?? c[0],
    back: c.back ?? c[1]
  }))

  await deckDB.transaction('rw', deckDB.decks, deckDB.cards, async () => {
    await deckDB.decks.add({
      id: deckId,
      name,
      cardCount: cards.length,
      importedAt: Date.now()
    })
    await deckDB.cards.bulkAdd(cards)
  })
  return deckId
}
