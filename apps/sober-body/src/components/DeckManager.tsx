import { useDecks } from '../../../../packages/core-speech/src/hooks/useDecks'

export default function DeckManager() {
  const { decks, deleteDeck, clearAllDecks } = useDecks()

  const openDeck = (id: string) => {
    window.location.href = `/coach/deck/${id}`
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Decks</h2>
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {decks.map(d => (
          <li key={d.id} className="border rounded p-2 flex justify-between">
            <span>
              {d.name}{' '}
              <small className="text-gray-500">({d.cardCount})</small>
            </span>
            <span className="space-x-2">
              <button onClick={() => openDeck(d.id)}>Open</button>
              <button onClick={() => deleteDeck(d.id)} className="text-red-600">
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
      {decks.length > 0 && (
        <button className="text-red-700" onClick={clearAllDecks}>
          Clear all decks
        </button>
      )}
    </div>
  )
}
