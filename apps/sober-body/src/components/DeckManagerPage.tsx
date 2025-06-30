import { useEffect, useState } from 'react'
import { loadDecks, saveDeck, deleteDeck, exportDeck, importDeck } from '../features/games/deck-storage'
import type { Deck } from '../features/games/deck-types'
import DeckModal from './DeckModal'

export default function DeckManagerPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [edit, setEdit] = useState<Deck | null>(null)
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
        </span>
      </h2>
      <ul className="space-y-2">
        {decks.map(d=>(
          <li key={d.id} className="border p-2 flex justify-between items-center">
            <span>{d.title} <span className="text-xs">{d.lines.length} lines</span></span>
            <span className="space-x-2">
              {!d.sig && <button className="border px-2" onClick={()=>setEdit(d)}>✎</button>}
              <button className="border px-2" onClick={()=>download(d)}>⇩</button>
              {!d.sig && <button className="border px-2" onClick={async ()=>{await deleteDeck(d.id);refresh()}}>🗑</button>}
            </span>
          </li>
        ))}
      </ul>
      {edit && <DeckModal deck={edit} onSave={async d=>{await saveDeck(d);setEdit(null);refresh()}} onClose={()=>setEdit(null)} />}
    </div>
  )
}
