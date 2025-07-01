import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PronunciationCoachUI from '../components/PronunciationCoachUI'
import { useDecks } from '../features/games/deck-context'

export default function CoachPage() {
  const [params] = useSearchParams()
  const requestedId = params.get('deck')
  const { decks, setActiveDeck } = useDecks()

  useEffect(() => {
    if (!requestedId || !decks.length) return
    const found = decks.find(d => d.id === requestedId)
    if (found) setActiveDeck(found.id)
    else console.warn('Deck id not found:', requestedId)
  }, [requestedId, decks, setActiveDeck])

  return <PronunciationCoachUI />
}
