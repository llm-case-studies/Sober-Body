export interface ChallengeData {
  deckId: string
  unit: number
  text: string
  ownerScore: number
}

export function encodeChallenge(data: ChallengeData): string {
  return btoa(JSON.stringify(data))
}

export function decodeChallenge(payload: string): ChallengeData {
  return JSON.parse(atob(payload))
}
