import { useEffect, useState } from 'react'
import { loadBrief } from './brief-storage'
import { getBriefForDeck } from './grammar-loader'

export default function useBriefExists(deckId: string): boolean {
  const [exists, setExists] = useState(false)
  useEffect(() => {
    let alive = true
    loadBrief(deckId).then(doc => {
      if (!alive) return
      if (doc) setExists(true)
      else setExists(Boolean(getBriefForDeck(deckId)))
    })
    return () => {
      alive = false
    }
  }, [deckId])
  return exists
}
