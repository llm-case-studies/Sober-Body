import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDecks } from '../features/games/deck-context'
import { getTopics } from '../features/games/get-topics'

export default function SituationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { decks, setActiveDeck } = useDecks()
  const [selected, setSel] = useState<string | null>(null)
  if (!open) return null
  const presets = decks.filter(d => d.tags?.includes('official'))
  const topics = getTopics(presets)
  const visible = selected ? presets.filter(d => d.tags?.includes(selected)) : presets
  return createPortal(
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[28rem] max-h-[80vh] overflow-y-auto rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Practice Packs</h3>
        {presets.length === 0 ? (
          <p>Loading…</p>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto mb-4">
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setSel(sel => sel === t ? null : t)}
                  className={`px-2 py-1 rounded-full text-xs ${selected === t ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
                >
                  {t.slice(6)}
                </button>
              ))}
            </div>
            {visible.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">
                No decks tagged <strong>{selected?.slice(6)}</strong>.
              </p>
            )}
            <ul className="grid grid-cols-2 gap-4">
              {visible.map(d => (
                <li
                  key={d.id}
                  onClick={() => { setActiveDeck(d.id); onClose() }}
                  className="border rounded p-3 hover:bg-sky-50 cursor-pointer"
                >
                  <h4 className="font-medium">{d.title}</h4>
                  <p className="text-xs text-gray-500">{d.lines.length} phrases</p>
                </li>
              ))}
            </ul>
          </>
        )}
        <button className="absolute top-3 right-4" onClick={onClose}>✕</button>
      </div>
    </div>,
    document.getElementById('portal-root')!
  )
}
