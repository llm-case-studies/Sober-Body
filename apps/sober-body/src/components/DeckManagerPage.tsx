import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadDecks,
  saveDeck,
  deleteDeck,
  exportDeck,
  importDeck,
  importDeckFiles,
} from '../features/games/deck-storage'
import { getCategories } from '../features/games/get-categories'
import { getLanguages } from '../features/games/get-languages'
import type { Deck } from '../features/games/deck-types'
import DeckModal from './DeckModal'
import PasteDeckModal from './PasteDeckModal'

export default function DeckManagerPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [edit, setEdit] = useState<Deck | null>(null)
  const [paste, setPaste] = useState(false)
  const navigate = useNavigate()
  const handlePlay = (id: string) => {
    navigate(`/coach?deck=${encodeURIComponent(id)}`)
  }
  const refresh = async () => {
    const arr = await loadDecks()
    arr.sort((a,b)=>(b.updated??0)-(a.updated??0))
    setDecks(arr)
  }
  useEffect(() => { refresh() }, [])
  const startNew = () => setEdit({ id: crypto.randomUUID(), title: '', lang: 'en-US', lines: [], tags: [] })
  const handleFile = async (f: File) => { await importDeck(await f.text()); refresh() }
  const handleFolder = async (list: FileList) => {
    const { imported, fails } = await importDeckFiles(list)
    refresh()
    alert(`Imported ${imported} decks${fails.length ? `, ${fails.length} skipped` : ''}`)
    if (fails.length) alert(fails.join('\n'))
  }
  const download = (d: Deck) => {
    const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
    const url = URL.createObjectURL(new Blob([exportDeck(d)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `${slug}-${d.lang}.json` })
    a.click(); URL.revokeObjectURL(url)
  }
  const cats = getCategories(decks)
  const langs = getLanguages(decks)
  const visible = decks.filter(d =>
    (!selectedCat || d.tags?.includes(selectedCat)) &&
    (!selectedLang || d.lang === selectedLang)
  )
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl mb-4 flex justify-between">
        <span>My Decks</span>
        <span className="space-x-2">
          <button className="border px-2" onClick={startNew}>+ New Deck</button>
          <label className="border px-2 cursor-pointer">
            Import JSON<input type="file" accept="application/json" className="hidden" onChange={e=>e.target.files&&handleFile(e.target.files[0])}/>
          </label>
          <label className="border px-2 cursor-pointer">
            Import folder<input type="file" accept=".json" webkitdirectory multiple className="hidden" onChange={e=>e.target.files&&handleFolder(e.target.files)}/>
          </label>
          <button className="border px-2" onClick={() => setPaste(true)}>Import ⌘V</button>
        </span>
      </h2>
      <div className="flex gap-2 overflow-x-auto mb-4">
        <button
          className={`px-2 py-1 rounded-full text-xs ${selectedCat===null?'bg-sky-600 text-white':'bg-gray-200'}`}
          onClick={() => setSelectedCat(null)}
        >
          All
        </button>
        {cats.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(c => c===cat?null:cat)}
            className={`px-2 py-1 rounded-full text-xs ${selectedCat===cat?'bg-sky-600 text-white':'bg-gray-200'}`}
          >
            {cat.slice(4)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto mb-4">
        <button
          className={`px-2 py-1 rounded-full text-xs ${selectedLang===null?'bg-sky-600 text-white':'bg-gray-200'}`}
          onClick={() => setSelectedLang(null)}
        >
          All
        </button>
        {langs.map(l => (
          <button
            key={l}
            onClick={() => setSelectedLang(c => c===l?null:l)}
            className={`px-2 py-1 rounded-full text-xs ${selectedLang===l?'bg-sky-600 text-white':'bg-gray-200'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {visible.map(deck => (
          <li
            key={deck.id}
            className="flex items-center gap-3 border rounded px-3 py-2 hover:bg-sky-50"
          >
            <button
              onClick={() => handlePlay(deck.id)}
              className="text-sky-600 text-lg"
              title="Start drill"
              aria-label="Start drill"
            >
              ▶
            </button>
            <div className="flex-1">
              <div className="font-medium">{deck.title}</div>
              <div className="text-xs text-gray-500">
                {deck.lines.length} phrases • {deck.lang}
              </div>
            </div>
            {!deck.sig && (
              <button
                title="Edit"
                aria-label="Edit deck"
                onClick={() => setEdit(deck)}
                className="text-xs"
              >
                ✎
              </button>
            )}
            <button
              title="Download"
              aria-label="Download deck"
              onClick={() => download(deck)}
              className="text-xs"
            >
              ⇩
            </button>
            {!deck.sig && (
              <button
                title="Delete"
                aria-label="Delete deck"
                onClick={async () => {
                  await deleteDeck(deck.id)
                  refresh()
                }}
                className="text-xs"
              >
                🗑
              </button>
            )}
          </li>
        ))}
      </ul>
      {edit && <DeckModal deck={edit} allCats={cats} onSave={async d=>{await saveDeck(d);setEdit(null);refresh()}} onClose={()=>setEdit(null)} />}
      {paste && <PasteDeckModal onSave={async d=>{await saveDeck(d);setPaste(false);refresh()}} onClose={()=>setPaste(false)} />}
    </div>
  )
}
