import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PronunciationCoachUI from '../components/PronunciationCoachUI'
import { useDecks } from '../features/games/deck-context'

export default function CoachPage() {
  const [params] = useSearchParams()
  const requestedId = params.get('deck')
  const { decks, setActiveDeck, activeDeck } = useDecks()

  useEffect(() => {
    if (!requestedId || !decks.length) return
    if (requestedId !== activeDeck && decks.some(d => d.id === requestedId)) {
      setActiveDeck(requestedId)
    }
  }, [requestedId, decks, activeDeck, setActiveDeck])

  if (requestedId && decks.length && !decks.some(d => d.id === requestedId)) {
    console.warn('Deck ID from URL not found; using default.')
  }

  return <PronunciationCoachUI />
}
