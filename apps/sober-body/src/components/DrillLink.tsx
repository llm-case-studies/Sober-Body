import type { Deck } from '../features/games/deck-types'

export default function DrillLink({ deck }: { deck: Deck }) {
  const handle = () => {
    const url = `/pc/coach/${encodeURIComponent(deck.id)}`
    window.open(url, '_blank')
  }
  return (
    <button
      onClick={handle}
      title={`Drill "${deck.title}"`}
      aria-label="Start drill"
      className="text-sky-600 text-lg"
    >
      ▶
    </button>
  )
}
