import { get, set } from 'idb-keyval'

export const KEYS = { briefs: 'pc_briefs' } as const

export interface BriefDoc {
  deckId: string
  grammar: { verb_tenses: string[]; prepositions: string[] }
  notes: string
  updatedAt: number
}

export async function loadBrief(id: string): Promise<BriefDoc | undefined> {
  const map = (await get<Record<string, BriefDoc>>(KEYS.briefs)) ?? {}
  return map[id]
}

export async function saveBrief(doc: BriefDoc): Promise<void> {
  const map = (await get<Record<string, BriefDoc>>(KEYS.briefs)) ?? {}
  map[doc.deckId] = { ...doc, updatedAt: Date.now() }
  await set(KEYS.briefs, map)
}

export async function deleteBrief(id: string): Promise<void> {
  const map = (await get<Record<string, BriefDoc>>(KEYS.briefs)) ?? {}
  if (id in map) {
    delete map[id]
    await set(KEYS.briefs, map)
  }
}
