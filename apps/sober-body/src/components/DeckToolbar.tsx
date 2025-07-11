import { useRef } from 'react'
import type { Deck } from '../features/games/deck-types'
import { exportZip } from '../features/games/zip-utils'
import { loadBrief, type BriefDoc } from '../brief-storage'
import { importDeckZip, importDeckFolder } from '../../../../packages/core-storage/src/import-decks'
import { saveLastDir, getLastDir } from '../../../../packages/core-storage/src/ui-store'
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
  const folderRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)
  const supportsFSA = "showOpenFilePicker" in window
  const supportsDir = "showDirectoryPicker" in window
  const handleZipImport = async (file: File) => {
    await importDeckZip(file, db)
    refresh()
  }

  const handleFolderFiles = async (files: FileList | File[]) => {
    await importDeckFolder(files, db)
    refresh()
  }

  const pickFolder = async () => {
    if (supportsDir) {
      try {
        const last = await getLastDir(db)
        const dir = await (window as any).showDirectoryPicker({
          startIn: last ?? "documents",
        })
        const fileHandles: any[] = []
        for await (const h of dir.values()) {
          if (h.kind === "file" && h.name.endsWith(".json"))
            fileHandles.push(h)
        }
        const files = await Promise.all(fileHandles.map((h: any) => h.getFile()))
        if (files.length) {
          await saveLastDir(db, dir as any)
          await handleFolderFiles(files)
        }
        return
      } catch (e: any) {
        if (e?.name === "AbortError") return
        /* fall back */
      }
    }
    folderRef.current?.click()
  }

  const pickZip = async () => {
    if (supportsFSA) {
      try {
        const last = await getLastDir(db)
        const [h] = await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            { description: "Zip", accept: { "application/zip": [".zip"] } },
          ],
          startIn: last,
        })
        const file = await h.getFile()
        // Save the parent directory, not the file itself
        if (h.getParent) {
          try {
            const parentDir = await h.getParent()
            await saveLastDir(db, parentDir as any)
          } catch (e) {
            // getParent might not be supported, skip saving directory
          }
        }
        await handleZipImport(file)
        return
      } catch (e: any) {
        if (e?.name === "AbortError") return
        /* fall back */
      }
    }
    zipRef.current?.click()
  }

  const pickJson = async () => {
    if (supportsFSA) {
      try {
        const last = await getLastDir(db)
        const handles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            { description: "JSON", accept: { "application/json": [".json"] } },
          ],
          startIn: last,
        })
        const files = await Promise.all(handles.map((h: any) => h.getFile()))
        if (files.length) {
          // Save the parent directory of the first file
          if (handles[0].getParent) {
            try {
              const parentDir = await handles[0].getParent()
              await saveLastDir(db, parentDir as any)
            } catch (e) {
              // getParent might not be supported, skip saving directory
            }
          }
          // Use the first file for the onFile callback
          onFile(files[0])
        }
        return
      } catch (e: any) {
        if (e?.name === "AbortError") return
        /* fall back */
      }
    }
    jsonRef.current?.click()
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
      <button className="border px-2 cursor-pointer" onClick={pickJson}>
        Import JSON
      </button>
      <input
        ref={jsonRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onFile(e.target.files[0])
            e.target.value = ""
          }
        }}
      />
      <button className="border px-2 cursor-pointer" onClick={pickFolder}>
        Import folder
      </button>
      <input
        ref={folderRef}
        type="file"
        accept=".json"
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={e => {
          if (!e.target.files) return
          handleFolderFiles(e.target.files)
          e.target.value = ""
        }}
      />
      <button className="border px-2 cursor-pointer" onClick={pickZip}>
        Import ZIP
      </button>
      <input
        ref={zipRef}
        type="file"
        accept="application/zip"
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            handleZipImport(e.target.files[0])
            e.target.value = ""
          }
        }}
      />
      <button className="border px-2" onClick={onPaste}>
        Import ⌘V
      </button>
      <button className="border px-2" onClick={handleZipExport}>
        Export ZIP
      </button>
    </div>
  )
}
