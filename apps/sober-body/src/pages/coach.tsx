import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PronunciationCoachUI from '../components/PronunciationCoachUI'
import { useDecks } from '../features/games/deck-context'

export default function CoachPage() {
  const [params] = useSearchParams()
  const deckId = params.get('deck')
  const { decks, setActiveDeck } = useDecks()

  useEffect(() => {
    if (deckId) {
      if (decks.find(d => d.id === deckId)) {
        setActiveDeck(deckId)
      } else {
        console.warn('Unknown deck id in URL, falling back.')
      }
    }
  }, [deckId, setActiveDeck, decks])

  return <PronunciationCoachUI />
}
