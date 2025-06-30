import React from 'react'
import { createPortal } from 'react-dom'
import { useDecks } from '../features/games/deck-context'

export default function SituationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { decks, setActiveDeck } = useDecks()
  if (!open) return null
  const presets = decks.filter(d => d.tags?.includes('official'))
  return createPortal(
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[28rem] max-h-[80vh] overflow-y-auto rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Practice Packs</h3>
        {presets.length === 0 ? (
          <p>Loading…</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4">
            {presets.map(d => (
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
        )}
        <button className="absolute top-3 right-4" onClick={onClose}>✕</button>
      </div>
    </div>,
    document.getElementById('portal-root')!
  )
}
