import type Dexie from 'dexie'
import type { AppDB } from './db'

export function uiKV(db: AppDB) {
  return db.table('ui') as Dexie.Table<any, string>
}

export async function saveLastDir(db: AppDB, h: FileSystemDirectoryHandle) {
  try {
    // Save to deck-specific recent directories list
    await saveRecentDeckDir(db, h)
    // Also save as last directory for backward compatibility
    await uiKV(db).put({ id: 'lastImportDir', handle: h })
    console.log('Saved directory handle to IndexedDB:', h)
  } catch (e) {
    console.log('Failed to save directory handle:', e)
  }
}

export async function getLastDir(db: AppDB) {
  try {
    const result = await uiKV(db).get('lastImportDir')
    console.log('Retrieved directory handle:', result?.handle)
    return result?.handle as any
  } catch (e) {
    console.log('Failed to retrieve directory handle:', e)
    return null
  }
}

export async function saveRecentDir(db: AppDB, h: FileSystemDirectoryHandle) {
  try {
    // Get existing recent directories
    const existing = await uiKV(db).get('recentImportDirs')
    let recentDirs: Array<{name: string, handle: FileSystemDirectoryHandle}> = existing?.dirs || []
    
    // Remove if already exists (to move to front)
    recentDirs = recentDirs.filter(dir => dir.name !== h.name)
    
    // Add to front
    recentDirs.unshift({ name: h.name, handle: h })
    
    // Keep only last 10 directories
    recentDirs = recentDirs.slice(0, 10)
    
    await uiKV(db).put({ id: 'recentImportDirs', dirs: recentDirs })
    console.log('Saved to recent directories:', h.name)
  } catch (e) {
    console.log('Failed to save recent directory:', e)
  }
}

export async function getRecentDirs(db: AppDB): Promise<Array<{name: string, handle: FileSystemDirectoryHandle}>> {
  try {
    const result = await uiKV(db).get('recentImportDirs')
    return result?.dirs || []
  } catch (e) {
    console.log('Failed to retrieve recent directories:', e)
    return []
  }
}

// Deck-specific recent directories
export async function saveRecentDeckDir(db: AppDB, h: FileSystemDirectoryHandle) {
  try {
    // Get existing recent deck directories
    const existing = await uiKV(db).get('recentDeckImportDirs')
    let recentDirs: Array<{name: string, handle: FileSystemDirectoryHandle, timestamp: number}> = existing?.dirs || []
    
    // Remove if already exists (to move to front)
    recentDirs = recentDirs.filter(dir => dir.name !== h.name)
    
    // Add to front with timestamp
    recentDirs.unshift({ name: h.name, handle: h, timestamp: Date.now() })
    
    // Keep only last 10 directories
    recentDirs = recentDirs.slice(0, 10)
    
    await uiKV(db).put({ id: 'recentDeckImportDirs', dirs: recentDirs })
    console.log('Saved to recent deck directories:', h.name)
  } catch (e) {
    console.log('Failed to save recent deck directory:', e)
  }
}

export async function getRecentDeckDirs(db: AppDB): Promise<Array<{name: string, handle: FileSystemDirectoryHandle, timestamp: number}>> {
  try {
    const result = await uiKV(db).get('recentDeckImportDirs')
    return result?.dirs || []
  } catch (e) {
    console.log('Failed to retrieve recent deck directories:', e)
    return []
  }
}
