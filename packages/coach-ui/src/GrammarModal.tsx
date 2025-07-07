import React from 'react'
import type { BriefWithRefs } from '../../../apps/sober-body/src/grammar-loader'

export default function GrammarModal({
  open,
  brief,
  onClose,
}: {
  open: boolean
  brief: BriefWithRefs
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md p-4 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Grammar Brief – {brief.story}</h2>
        {brief.notes && (
          <div className="mb-4">
            <h3 className="font-semibold mb-1">Notes</h3>
            <ul className="list-disc pl-5 text-sm">
              {brief.notes.map((n, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: n }} />
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {brief.linkedRefs.map(r => (
            <details key={r.id} className="border px-2 py-1 rounded">
              <summary className="cursor-pointer font-semibold">{r.title}</summary>
              <p className="text-sm mb-1">{r.description}</p>
              <ul className="list-disc pl-5 text-sm">
                {r.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <div className="text-right mt-4">
          <button onClick={onClose} className="px-4 py-1 border">Close</button>
        </div>
      </div>
    </div>
  )
}
