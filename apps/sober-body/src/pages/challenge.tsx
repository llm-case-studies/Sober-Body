import { useParams, Link } from 'react-router-dom'
import { decodeChallenge } from '../features/games/challenge'

export default function ChallengePage() {
  const { payload = '' } = useParams<{ payload: string }>()
  const data = decodeChallenge(payload)
  return (
    <div className="p-4">
      <h2 className="text-lg mb-2">Challenge</h2>
      <p>{data.text}</p>
      <Link to={`/coach/deck/${encodeURIComponent(data.deckId)}`} className="text-sky-600 underline">
        Open Deck
      </Link>
    </div>
  )
}
