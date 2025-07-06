import type Dexie from 'dexie'
import type { AppDB } from './db'

export function uiKV(db: AppDB) {
  return db.table('ui') as Dexie.Table<any, string>
}

export async function saveLastDir(db: AppDB, h: FileSystemDirectoryHandle) {
  await uiKV(db).put({ id: 'lastImportDir', handle: h })
}

export async function getLastDir(db: AppDB) {
  return uiKV(db).get('lastImportDir').then(r => r?.handle as any)
}
