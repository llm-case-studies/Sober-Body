import { useState } from 'react'
import PronunciationCoach from '../features/games/PronunciationCoach'

export default function PronunciationCoachUI() {
  const [phrase, setPhrase] = useState('She sells seashells')
  const [locale, setLocale] = useState<'en-US' | 'pt-BR'>('en-US')
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Pronunciation Coach</h2>
      <textarea
        className="border p-2 w-full"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
      />
      <select
        className="border p-1"
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en-US' | 'pt-BR')}
      >
        <option value="en-US">English</option>
        <option value="pt-BR">Portuguese</option>
      </select>
      <PronunciationCoach phrase={phrase} locale={locale} />
    </div>
  )
}
