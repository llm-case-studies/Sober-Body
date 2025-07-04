import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { db, resetDB } from './db'
import { importDeckZip, importDeckFolder } from '../../../packages/core-storage/src/import-decks'

function Beta() {
  const [decks, setDecks] = useState<any[]>([])
  const zipRef = useRef<HTMLInputElement>(null)
  const refresh = async () => {
    setDecks(await db.decks.toArray())
  }
  useEffect(() => {
    refresh()
  }, [])
  const handleZip = async (f: File) => {
    await importDeckZip(f, db)
    refresh()
  }
  const handleFolder = async (list: FileList) => {
    await importDeckFolder(list, db)
    refresh()
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
      <label className="block cursor-pointer border px-2">
        Import folder
        <input
          type="file"
          accept=".json"
          multiple
          webkitdirectory=""
          className="hidden"
          onChange={e => e.target.files && handleFolder(e.target.files)}
        />
      </label>
      <button className="border px-2" onClick={async () => { await db.delete(); resetDB(); refresh() }}>
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

createRoot(document.getElementById('root')!).render(
  import.meta.env.VITE_DECK_V2 === 'true' ? <Beta /> : <div>Hello PronunCo</div>
)
