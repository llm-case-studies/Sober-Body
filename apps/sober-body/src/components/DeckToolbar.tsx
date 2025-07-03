import { useRef } from 'react'
import type { Deck } from '../features/games/deck-types'
import { exportZip, importZip } from '../features/games/zip-utils'
import { saveDeck } from '../features/games/deck-storage'
import { saveBrief, loadBrief, type BriefDoc } from '../brief-storage'

export default function DeckToolbar({
  decks,
  refresh,
  onNew,
  onPaste,
  onFile,
  onFolder,
}: {
  decks: Deck[]
  refresh: () => void
  onNew: () => void
  onPaste: () => void
  onFile: (file: File) => void
  onFolder: (files: FileList) => void
}) {
  const zipRef = useRef<HTMLInputElement>(null)
  const handleZipImport = async (file: File) => {
    const { decks: ds, briefs } = await importZip(file)
    for (const d of ds) await saveDeck(d)
    for (const b of briefs) await saveBrief(b)
    refresh()
  }
  const handleZipExport = async () => {
    const briefs: BriefDoc[] = []
    for (const d of decks) {
      const b = await loadBrief(d.id)
      if (b) briefs.push(b)
    }
    const blob = await exportZip(decks, briefs)
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'decks.zip',
    })
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-x-2">
      <button className="border px-2" onClick={onNew}>
        + New Deck
      </button>
      <label className="border px-2 cursor-pointer">
        Import JSON
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={e => e.target.files && onFile(e.target.files[0])}
        />
      </label>
      <label className="border px-2 cursor-pointer">
        Import folder
        <input
          type="file"
          accept=".json"
          webkitdirectory=""
          multiple
          className="hidden"
          onChange={e => e.target.files && onFolder(e.target.files)}
        />
      </label>
      <label className="border px-2 cursor-pointer">
        Import ZIP
        <input
          ref={zipRef}
          type="file"
          accept="application/zip"
          className="hidden"
          onChange={e => e.target.files && handleZipImport(e.target.files[0])}
        />
      </label>
      <button className="border px-2" onClick={onPaste}>
        Import ⌘V
      </button>
      <button className="border px-2" onClick={handleZipExport}>
        Export ZIP
      </button>
    </div>
  )
}
