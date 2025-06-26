export type BusTopic = 'PRONUN_SCORE'
export type BusProfile = 'strict' | 'standard' | 'offline_relaxed'

export interface BusEnvelope<T> {
  topic: BusTopic
  payload: T
  profile: BusProfile
}

export function emit<T>(envelope: BusEnvelope<T>): void {
  window.dispatchEvent(new CustomEvent(envelope.topic, { detail: envelope }))
}
