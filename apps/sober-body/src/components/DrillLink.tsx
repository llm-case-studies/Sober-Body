import { Link } from 'react-router-dom'
import type { Deck } from '../features/games/deck-types'

export default function DrillLink({ deck }: { deck: Deck }) {
  return (
    <Link
      to={`/coach/deck/${encodeURIComponent(deck.id)}`}
      title={`Drill "${deck.title}"`}
      aria-label="Start drill"
      className="text-sky-600 text-lg"
    >
      ▶
    </Link>
  )
}
