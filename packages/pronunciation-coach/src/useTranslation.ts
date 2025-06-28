import { useEffect, useState } from 'react'
import { translate } from './translate'

export default function useTranslation(word: string, lang: string) {
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    if (!word) { setResult(null); return }
    let active = true
    translate(word, lang).then(t => {
      if (active) setResult(t)
    })
    return () => { active = false }
  }, [word, lang])

  return result
}
