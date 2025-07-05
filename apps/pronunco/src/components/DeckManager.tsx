import { useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, resetDB } from '../db'
import { importDeckZip, importDeckFolder } from '../../../../packages/core-storage/src/import-decks'

export default function DeckManager() {
  const zipRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const decks = useLiveQuery(() => db.decks.toArray(), [], []) || []

  const handleZip = async (file: File) => {
    await importDeckZip(file, db)
  }

  const handleFolderFiles = async (files: FileList | File[]) => {
    await importDeckFolder(files, db)
  }

  const handleFolder = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dir = await window.showDirectoryPicker()
        const files: File[] = []
        for await (const entry of dir.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.json')) {
            files.push(await entry.getFile())
          }
        }
        if (files.length) await handleFolderFiles(files)
      } catch {}
    } else {
      folderRef.current?.click()
    }
  }

  const clearDecks = async () => {
    await db.delete()
    resetDB()
  }

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg">Deck Manager (beta)</h2>
      <label className="block cursor-pointer border px-2">
        Import ZIP
        <input
          ref={zipRef}
          type="file"
          accept="application/zip"
          className="hidden"
          onChange={e => e.target.files && handleZip(e.target.files[0])}
        />
      </label>
      <input
        ref={folderRef}
        type="file"
        accept=".json"
        multiple
        webkitdirectory=""
        className="hidden"
        onChange={e => e.target.files && handleFolderFiles(e.target.files)}
      />
      <button className="border px-2" onClick={handleFolder}>
        Import folder (beta)
      </button>
      <button className="border px-2" title="Clear decks" onClick={clearDecks}>
        Clear decks (beta)
      </button>
      <ul>
        {decks.map(d => (
          <li key={d.id}>{d.title} – {d.lang}</li>
        ))}
      </ul>
    </div>
  )
}
