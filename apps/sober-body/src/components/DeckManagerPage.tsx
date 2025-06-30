import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecks } from '../features/games/deck-context'
import {
  loadDecks,
  saveDeck,
  deleteDeck,
  exportDeck,
  importDeck,
} from '../features/games/deck-storage'
import type { Deck } from '../features/games/deck-types'
import DeckModal from './DeckModal'
import PasteDeckModal from './PasteDeckModal'

export default function DeckManagerPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [edit, setEdit] = useState<Deck | null>(null)
  const [paste, setPaste] = useState(false)
  const navigate = useNavigate()
  const { setActiveDeck } = useDecks()
  const refresh = async () => {
    const arr = await loadDecks()
    arr.sort((a,b)=>(b.updated??0)-(a.updated??0))
    setDecks(arr)
  }
  useEffect(() => { refresh() }, [])
  const startNew = () => setEdit({ id: crypto.randomUUID(), title: '', lang: 'en-US', lines: [], tags: [] })
  const handleFile = async (f: File) => { await importDeck(await f.text()); refresh() }
  const download = (d: Deck) => {
    const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
    const url = URL.createObjectURL(new Blob([exportDeck(d)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `${slug}-${d.lang}.json` })
    a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl mb-4 flex justify-between">
        <span>My Decks</span>
        <span className="space-x-2">
          <button className="border px-2" onClick={startNew}>+ New Deck</button>
          <label className="border px-2 cursor-pointer">
            Import JSON<input type="file" accept="application/json" className="hidden" onChange={e=>e.target.files&&handleFile(e.target.files[0])}/>
          </label>
          <button className="border px-2" onClick={() => setPaste(true)}>Import ⌘V</button>
        </span>
      </h2>
      <ul className="space-y-2">
        {decks.map(deck => (
          <li
            key={deck.id}
            className="flex items-center gap-3 border rounded px-3 py-2 hover:bg-sky-50"
          >
            <button
              onClick={() => {
                setActiveDeck(deck.id)
                navigate('/coach')
              }}
              className="text-sky-600 text-lg"
              title="Start drill"
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
                onClick={() => setEdit(deck)}
                className="text-xs"
              >
                ✎
              </button>
            )}
            <button
              title="Download"
              onClick={() => download(deck)}
              className="text-xs"
            >
              ⇩
            </button>
            {!deck.sig && (
              <button
                title="Delete"
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
      {edit && <DeckModal deck={edit} onSave={async d=>{await saveDeck(d);setEdit(null);refresh()}} onClose={()=>setEdit(null)} />}
      {paste && <PasteDeckModal onSave={async d=>{await saveDeck(d);setPaste(false);refresh()}} onClose={()=>setPaste(false)} />}
    </div>
  )
}
