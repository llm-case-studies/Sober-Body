import { useEffect, useState } from 'react'
import { translate } from './translate'

export default function useTranslation(word: string, to: string) {
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    if (!word) { setResult(null); return }
    let active = true
    translate(word, to).then(t => {
      if (active) setResult(t)
    })
    return () => { active = false }
  }, [word, to])

  return result
}
