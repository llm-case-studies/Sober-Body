import { useState } from 'react'
import PronunciationCoach from '../features/games/PronunciationCoach'

export default function PronunciationCoachUI() {
  const [raw, setRaw] = useState('She sells seashells')
  const [deck, setDeck] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [locale, setLocale] = useState<'en-US' | 'pt-BR'>('en-US')

  const start = () => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    setDeck(lines)
    setIndex(0)
  }

  const current = deck[index] ?? raw

  return (
    <div className="p-4 space-y-4 flex">
      <div className="w-1/4 pr-4 border-r">
        <h2 className="text-xl font-semibold mb-2">Pronunciation Coach</h2>
        <textarea
          className="border p-2 w-full mb-2"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="space-x-2 mb-2">
          <select
            className="border p-1"
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en-US' | 'pt-BR')}
          >
            <option value="en-US">English</option>
            <option value="pt-BR">Portuguese</option>
          </select>
          <button onClick={start} className="border px-2 py-1">
            Start Drill
          </button>
        </div>
        {deck.length > 0 && (
          <ul className="space-y-1 text-sm">
            {deck.map((line, i) => (
              <li key={i}>
                <button
                  className={
                    'w-full text-left ' + (i === index ? 'font-bold' : '')
                  }
                  onClick={() => setIndex(i)}
                >
                  {line}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1 pl-4 space-y-2">
        {deck.length > 0 && (
          <div className="space-x-2">
            <button
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
              className="border px-2 py-1"
            >
              Prev
            </button>
            <button
              onClick={() => setIndex((i) => i + 1)}
              disabled={index >= deck.length - 1}
              className="border px-2 py-1"
            >
              Next
            </button>
          </div>
        )}
        <PronunciationCoach phrase={current} locale={locale} />
      </div>
    </div>
  )
}
