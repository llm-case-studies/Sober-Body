import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import PronunciationCoachUI from '../components/PronunciationCoachUI'
import { useDeck, useDecks } from '../features/games/deck-context'

export default function CoachPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { decks, setActiveDeck } = useDecks()
  const deck = useDeck(id)

  useEffect(() => {
    if (deck) setActiveDeck(deck.id)
  }, [deck, setActiveDeck])

  if (decks.length > 0 && !deck) return <Navigate to="/decks" replace />

  return <PronunciationCoachUI />
}
