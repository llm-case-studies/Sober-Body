import { createAppDB } from 'core-storage/src/db'

export const db = createAppDB(import.meta.env.MODE === 'sb' ? 'sober' : 'pronun')
