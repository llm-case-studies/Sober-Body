import React from 'react'
import { createRoot } from 'react-dom/client'
import PronunciationCoach from '../../apps/sober-body/src/features/games/PronunciationCoach'

function App() {
  return (
    <div className="p-4">
      <h1>Pronunciation Coach Playground</h1>
      <PronunciationCoach phrase="She sells seashells" locale="en-US" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
