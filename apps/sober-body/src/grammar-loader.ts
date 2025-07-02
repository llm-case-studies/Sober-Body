export interface Ref {
  id: string
  title: string
  description: string
  examples: string[]
}

export interface Brief {
  id: string
  story: string
  grammar: Record<string, string[]>
  notes?: string[]
}

export interface BriefWithRefs extends Brief {
  linkedRefs: Ref[]
}

const refFiles = import.meta.glob('/src/grammar/ref/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, Ref>
export const refs: Record<string, Ref> = Object.fromEntries(
  Object.values(refFiles).map(r => [r.id, r])
)

const briefFiles = import.meta.glob('/src/grammar/briefs/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, Brief>
export const briefs: Record<string, Brief> = Object.fromEntries(
  Object.values(briefFiles).map(b => [b.id, b])
)

export function getBriefForDeck(deckId: string): BriefWithRefs | null {
  const brief = Object.values(briefs).find(b => b.story === deckId)
  if (!brief) return null
  const linkedRefs = Object.values(brief.grammar)
    .flat()
    .map(id => refs[id])
    .filter(Boolean)
  return { ...brief, linkedRefs }
}
