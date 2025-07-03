import { encodeChallenge } from '../features/games/challenge'
import type { Deck } from '../features/games/deck-types'

export default function ChallengeLink({ deck }: { deck: Deck }) {
  const handle = async () => {
    const data = { deckId: deck.id, unit: 0, text: deck.lines[0] ?? '', ownerScore: 0 }
    const url = `${location.origin}/challenge/${encodeChallenge(data)}`
    try {
      await navigator.clipboard.writeText(url)
      alert('Challenge URL copied')
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      aria-label="Challenge deck"
      title="Challenge deck"
      onClick={handle}
      className="text-xs"
    >
      ⚔
    </button>
  )
}
