import { useEffect, useState } from 'react'
import Select from 'react-select'
import { refs } from '../grammar-loader'
import type { Deck } from '../features/games/deck-types'
import { loadBrief, saveBrief, deleteBrief, type BriefDoc } from '../brief-storage'

const tenseOpts = Object.values(refs)
  .filter(r => r.id.startsWith('tense:'))
  .map(r => ({ value: r.id, label: r.title }))
const prepOpts = Object.values(refs)
  .filter(r => r.id.startsWith('prep:'))
  .map(r => ({ value: r.id, label: r.title }))

export default function BriefDrawer({ deck, onClose }: { deck: Deck; onClose: () => void }) {
  const [verbTenses, setVerbTenses] = useState<string[]>([])
  const [preps, setPreps] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadBrief(deck.id).then(b => {
      if (b) {
        setVerbTenses(b.grammar.verb_tenses)
        setPreps(b.grammar.prepositions)
        setNotes(b.notes)
      }
    })
  }, [deck.id])

  const handleSave = async () => {
    const doc: BriefDoc = {
      deckId: deck.id,
      grammar: { verb_tenses: verbTenses, prepositions: preps },
      notes,
      updatedAt: Date.now()
    }
    await saveBrief(doc)
    onClose()
  }

  const handleDelete = async () => {
    await deleteBrief(deck.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex z-50">
      <div className="flex-1" onClick={onClose} />
      <div className="w-80 bg-white p-4 shadow-xl overflow-y-auto">
        <h2 className="font-semibold mb-4">{deck.title}</h2>
        <div className="mb-2 text-sm">Verb Tenses</div>
        <Select
          isMulti
          options={tenseOpts}
          value={tenseOpts.filter(o => verbTenses.includes(o.value))}
          onChange={vals => setVerbTenses(vals.map(v => (v as { value: string }).value))}
        />
        <div className="mb-2 mt-4 text-sm">Prepositions</div>
        <Select
          isMulti
          options={prepOpts}
          value={prepOpts.filter(o => preps.includes(o.value))}
          onChange={vals => setPreps(vals.map(v => (v as { value: string }).value))}
        />
        <div className="mt-4">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (markdown allowed)"
            className="border w-full h-32 p-1"
          />
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handleDelete} className="border px-2" aria-label="Delete brief">🗑 Delete</button>
          <button onClick={handleSave} className="border px-2" aria-label="Save brief">Save</button>
        </div>
      </div>
    </div>
  )
}
