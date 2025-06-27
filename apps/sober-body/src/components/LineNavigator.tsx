import React from 'react'

export interface LineNavigatorProps {
  lines: string[]
  active: number
  onSelect: (i: number) => void
}

export default function LineNavigator({ lines, active, onSelect }: LineNavigatorProps) {
  return (
    <ul className="space-y-1 text-sm overflow-y-auto">
      {lines.map((line, i) => (
        <li key={i}>
          <button
            className={'w-full text-left ' + (i === active ? 'font-bold' : '')}
            onClick={() => onSelect(i)}
          >
            {line}
          </button>
        </li>
      ))}
    </ul>
  )
}
