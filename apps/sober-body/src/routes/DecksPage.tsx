import { useDecks } from 'core-storage/useDecks'
import { importDeckFile } from 'core-storage/import'
import { exportDeck } from 'core-storage/export'
import { deckDB } from 'core-storage/db'

export default function DecksPage() {
  const { decks } = useDecks()

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await importDeckFile(file)
  }

  async function handleExport(id: string) {
    const blob = await exportDeck(id, true)
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `${id}.zip`
    })
    a.click()
  }

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <header className="flex gap-4 items-center">
        <h2 className="text-2xl font-bold flex-grow">Decks</h2>
        <label className="cursor-pointer" data-testid="import">
          <input type="file" hidden onChange={handleImport} />
          Import
        </label>
        {decks.length > 0 && (
          <button
            className="text-red-600"
            onClick={() => deckDB.delete()}
          >
            Clear all
          </button>
        )}
      </header>

      {decks.length === 0 && <p>No decks loaded. Import a ZIP or JSON.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map(d => (
          <li key={d.id} className="border rounded p-4">
            <span className="font-semibold">{d.name}</span>
            <span className="text-sm text-gray-600"> {d.cardCount} cards</span>
            <div className="mt-2 flex gap-2">
              <button onClick={() => handleExport(d.id)}>Export</button>
              <button
                onClick={() =>
                  deckDB.transaction('rw', deckDB.decks, deckDB.cards, async () => {
                    await deckDB.cards.where('deckId').equals(d.id).delete()
                    await deckDB.decks.delete(d.id)
                  })
                }
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
