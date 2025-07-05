import { useRef } from 'react'
import type { Deck } from '../features/games/deck-types'
import { exportZip } from '../features/games/zip-utils'
import { loadBrief, type BriefDoc } from '../brief-storage'
import { importDeckZip, importDeckFolder } from '../../../../packages/core-storage/src/import-decks'
import { db } from '../db'

export default function DeckToolbar({
  decks,
  refresh,
  onNew,
  onPaste,
  onFile,
}: {
  decks: Deck[]
  refresh: () => void
  onNew: () => void
  onPaste: () => void
  onFile: (file: File) => void
}) {
  const zipRef = useRef<HTMLInputElement>(null)
  const handleZipImport = async (file: File) => {
    await importDeckZip(file, db)
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
          onChange={e => {
            if (!e.target.files) return
            importDeckFolder(e.target.files, db).then(refresh)
          }}
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
