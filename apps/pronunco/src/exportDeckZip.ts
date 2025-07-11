import JSZip from 'jszip'
import type { AppDB } from '../../packages/core-storage/src/db'

export async function exportDeckZip(ids: string[], db: AppDB): Promise<Blob> {
  const zip = new JSZip()
  await Promise.all(
    ids.map(async id => {
      const deck = await db().decks.get(id)
      if (!deck) return
      const cards = await db().cards.where('deckId').equals(id).toArray()
      zip.file(
        `decks/${id}.json`,
        JSON.stringify({
          id: deck.id,
          title: deck.title,
          lang: deck.lang,
          tags: deck.tags,
          lines: cards.map(c => c.text)
        })
      )
    })
  )
  return zip.generateAsync({ type: 'blob' })
}
