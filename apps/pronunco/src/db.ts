import { createAppDB } from '../../../packages/core-storage/src/db'

export let db = createAppDB(import.meta.env.MODE === 'sb' ? 'sober' : 'pronun')
export const resetDB = () => {
  db = createAppDB('pronun')
}
