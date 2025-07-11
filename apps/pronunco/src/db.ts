import { createAppDB } from '../../../packages/core-storage/src/db'

let _db = createAppDB(import.meta.env.MODE === 'sb' ? 'sober' : 'pronun')

export const db = () => _db

export const resetDB = () => {
  _db = createAppDB('pronun')
}

export async function clearDecks() {
  await db().transaction('rw', db().decks, async () => {
    await db().decks.clear()
  })
}
