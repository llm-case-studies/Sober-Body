import JSZip from 'jszip'
import type { Deck } from './deck-types'
import type { BriefDoc } from '../../brief-storage'

export async function exportZip(decks: Deck[], briefs: BriefDoc[]): Promise<Blob> {
  const zip = new JSZip()
  decks.forEach(d => zip.file(`decks/${d.id}.json`, JSON.stringify(d)))
  briefs.forEach(b => zip.file(`briefs/${b.deckId}.json`, JSON.stringify(b)))
  zip.file(
    'manifest.json',
    JSON.stringify({
      exportedAt: Date.now(),
      appVersion: '0.9',
      decks: decks.map(d => d.id),
    })
  )
  return zip.generateAsync({ type: 'blob' })
}

export async function importZip(
  blob: Blob
): Promise<{ decks: Deck[]; briefs: BriefDoc[] }> {
  const zip = await JSZip.loadAsync(blob)
  const decks: Deck[] = []
  const briefs: BriefDoc[] = []
  await Promise.all(
    Object.entries(zip.files).map(async ([name, file]) => {
      if (name.startsWith('decks/') && name.endsWith('.json')) {
        decks.push(JSON.parse(await file.async('string')))
      } else if (name.startsWith('briefs/') && name.endsWith('.json')) {
        briefs.push(JSON.parse(await file.async('string')))
      }
    })
  )
  return { decks, briefs }
}
