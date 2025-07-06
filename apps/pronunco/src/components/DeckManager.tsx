import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, resetDB } from '../db'
import { importDeckZip, importDeckFolder } from '../../../../packages/core-storage/src/import-decks'
import { exportDeckZip } from '../exportDeckZip'

export default function DeckManager() {
  const zipRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const decks = useLiveQuery(() => db.decks.toArray(), [], []) || []
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSelectedIds(prev => {
      const keep = new Set<string>()
      for (const id of prev) if (decks.some(d => d.id === id)) keep.add(id)
      return keep
    })
  }, [decks])

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

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === decks.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(decks.map(d => d.id)))
  }

  const onDrill = () => {
    const id = [...selectedIds][0]
    if (id) navigate(`/coach/${id}`)
  }

  const onExport = async () => {
    await exportDeckZip([...selectedIds], db)
  }

  const onDelete = async () => {
    const ids = [...selectedIds]
    await db.transaction('rw', db.decks, async () => {
      await db.decks.bulkDelete(ids)
    })
    alert(`Deleted ${ids.length} decks`)
    setSelectedIds(new Set())
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
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-8 text-center">
              <input
                type="checkbox"
                aria-label="Select All"
                checked={selectedIds.size > 0 && decks.every(d => selectedIds.has(d.id))}
                onChange={toggleAll}
              />
            </th>
            <th className="text-left">Title</th>
            <th className="text-left">Lang</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {decks.map(d => (
            <tr key={d.id} className="border-t">
              <td className="text-center">
                <input
                  type="checkbox"
                  aria-label={`Select ${d.title}`}
                  checked={selectedIds.has(d.id)}
                  onChange={() => toggleId(d.id)}
                />
              </td>
              <td>{d.title}</td>
              <td>{d.lang}</td>
              <td className="text-center">
                <button aria-label="Drill deck" onClick={() => navigate(`/coach/${d.id}`)}>
                  ▶
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedIds.size > 0 && (
        <div data-testid="action-bar" className="border p-2 space-x-2">
          <button onClick={onDrill}>▶ Drill</button>
          <button onClick={() => alert('TODO')}>📝 Edit Grammar</button>
          <button onClick={onExport}>📤 Export ZIP</button>
          <button onClick={onDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  )
}
