import React from 'react'
import { useDecks } from '../features/games/deck-context'

export default function SituationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { decks, setActiveDeck } = useDecks()
  if (!open) return null
  const presets = decks.filter(d => d.preset)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-4 w-80 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl mb-4">Practice Packs</h3>
        <ul className="grid grid-cols-2 gap-4">
          {presets.map(d => (
            <li
              key={d.id}
              className="border p-3 rounded hover:bg-sky-50 cursor-pointer"
              onClick={() => { setActiveDeck(d.id); onClose() }}
            >
              <h4 className="font-medium">{d.title}</h4>
              <p className="text-xs text-gray-500">{d.lines.length} phrases</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
