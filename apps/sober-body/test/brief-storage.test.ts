import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { loadBrief, saveBrief } from '../src/brief-storage'
import useBriefExists from '../src/useBriefExists'
import { renderHook, act, waitFor } from '@testing-library/react'

async function clearDB() {
  const dbs = await indexedDB.databases?.()
  if (dbs) await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name!)))
}

describe('brief storage', () => {
  beforeEach(async () => {
    await clearDB()
  })

  it('saving brief persists value', async () => {
    await saveBrief({ deckId: 'd', grammar: { verb_tenses: [], prepositions: [] }, notes: 'n', updatedAt: 0 })
    const doc = await loadBrief('d')
    expect(doc?.notes).toBe('n')
  })

  it('useBriefExists true after save', async () => {
    const { result, rerender } = renderHook(({ id }) => useBriefExists(id), { initialProps: { id: 'x' } })
    expect(result.current).toBe(false)
    await act(async () => {
      await saveBrief({ deckId: 'x', grammar: { verb_tenses: [], prepositions: [] }, notes: '', updatedAt: 0 })
    })
    rerender({ id: 'x' })
    await waitFor(() => result.current === true)
  })
})
