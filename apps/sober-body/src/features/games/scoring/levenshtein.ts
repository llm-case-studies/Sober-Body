import levenshtein from 'fast-levenshtein'

export function score(ref: string, transcript: string): number {
  const dist = levenshtein.get(ref.toLowerCase(), transcript.toLowerCase())
  const maxLen = Math.max(ref.length, transcript.length)
  const pct = 100 * (1 - dist / maxLen)
  return Math.max(0, Math.min(100, Math.round(pct)))
}
