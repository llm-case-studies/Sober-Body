import { createAppDB } from '../../../packages/core-storage/src/db'

export let db = createAppDB(import.meta.env.MODE === 'sb' ? 'sober' : 'pronun')
export const resetDB = () => {
  db = createAppDB('pronun')
}

export async function clearDecks() {
  await db.transaction('rw', db.decks, async () => {
    await db.decks.clear()
  })
}
