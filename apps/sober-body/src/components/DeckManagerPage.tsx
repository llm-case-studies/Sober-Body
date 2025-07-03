import { useEffect, useState } from 'react'
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
import BriefDrawer from './BriefDrawer'
import DrillLink from './DrillLink'
import DeckToolbar from './DeckToolbar'
import ChallengeLink from './ChallengeLink'

export default function DeckManagerPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [catFilter, setCatFilter] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('pc_filterCats')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [langFilter, setLangFilter] = useState<string>(
    () => localStorage.getItem('pc_filterLang') || 'all'
  )
  const [edit, setEdit] = useState<Deck | null>(null)
  const [paste, setPaste] = useState(false)
  const [briefDeck, setBriefDeck] = useState<Deck | null>(null)
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
  useEffect(() => {
    localStorage.setItem('pc_filterCats', JSON.stringify(catFilter))
  }, [catFilter])
  useEffect(() => {
    localStorage.setItem('pc_filterLang', langFilter)
  }, [langFilter])

  const cats = getCategories(decks).map(c => c.slice(4))
  const langs = getLanguages(decks)
  const counts: Record<string, number> = {}
  cats.forEach(c => {
    counts[c] = decks.filter(d => d.tags?.includes('cat:' + c)).length
  })
  const visible = decks.filter(
    d =>
      (langFilter === 'all' || d.lang === langFilter) &&
      (catFilter.length === 0 || catFilter.every(t => d.tags?.includes('cat:' + t)))
  )
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl mb-4 flex justify-between">
        <span>My Decks</span>
        <DeckToolbar
          decks={decks}
          refresh={refresh}
          onNew={startNew}
          onPaste={() => setPaste(true)}
          onFile={handleFile}
          onFolder={handleFolder}
        />
      </h2>
      <div className="mb-4 space-y-2">
        <label className="block text-sm">
          Category:
          <select
            multiple
            aria-label="categories"
            value={catFilter}
            onChange={e =>
              setCatFilter(Array.from(e.target.selectedOptions).map(o => o.value))
            }
            className="border p-1 w-full"
          >
            {cats.map(c => (
              <option key={c} value={c}>
                {c} {counts[c] ? `(${counts[c]})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Language:
          <select
            aria-label="language"
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            className="border p-1 w-full"
          >
            <option value="all">All</option>
            {langs.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="space-y-2">
        {visible.map(deck => (
          <li
            key={deck.id}
            className="flex items-center gap-3 border rounded px-3 py-2 hover:bg-sky-50 group"
          >
            <DrillLink deck={deck} />
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
              title="Edit brief"
              aria-label="Edit brief"
              onClick={() => setBriefDeck(deck)}
              className="text-xs opacity-0 group-hover:opacity-100"
            >
              📖
            </button>
            <button
              title="Download"
              aria-label="Download deck"
              onClick={() => download(deck)}
              className="text-xs"
            >
              ⇩
            </button>
            <ChallengeLink deck={deck} />
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
      {edit && <DeckModal deck={edit} allCats={cats.map(c => 'cat:' + c)} onSave={async d=>{await saveDeck(d);setEdit(null);refresh()}} onClose={()=>setEdit(null)} />}
      {paste && <PasteDeckModal onSave={async d=>{await saveDeck(d);setPaste(false);refresh()}} onClose={()=>setPaste(false)} />}
      {briefDeck && <BriefDrawer deck={briefDeck} onClose={()=>{setBriefDeck(null);refresh()}} />}
    </div>
  )
}
