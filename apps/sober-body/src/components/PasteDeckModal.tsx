import { useState } from 'react'
import { LANGS } from '../../../../packages/pronunciation-coach/src/langs'
import type { Deck } from '../features/games/deck-types'

export default function PasteDeckModal({ onSave, onClose }: { onSave: (d: Deck) => void; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [lang, setLang] = useState(LANGS[0].code)
  const [tags, setTags] = useState('')
  const [text, setText] = useState('')
  const submit = () => {
    const lines = text
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
    if (lines.length < 1) {
      alert('Need at least one phrase')
      return
    }
    const deck: Deck = {
      id: crypto.randomUUID(),
      title,
      lang,
      lines,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      updated: Date.now(),
    }
    onSave(deck)
    onClose()
    alert('Deck added!')
  }
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded space-y-2 w-80">
        <input className="border w-full p-1" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <select className="border w-full p-1" value={lang} onChange={e => setLang(e.target.value)}>
          {LANGS.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <input className="border w-full p-1" value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2" />
        <textarea className="border w-full h-32 p-1" value={text} onChange={e => setText(e.target.value)} placeholder="One phrase per line…" />
        <div className="flex justify-end gap-2">
          <button className="border px-2" onClick={submit}>Save</button>
          <button className="border px-2" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
