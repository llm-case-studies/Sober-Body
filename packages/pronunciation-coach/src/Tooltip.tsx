import React, { useEffect } from 'react'
import useTranslation from './useTranslation'

interface Props {
  word: string
  lang: string
  x: number
  y: number
  onClose: () => void
}

export default function Tooltip({ word, lang, x, y, onClose }: Props) {
  const translation = useTranslation(word, lang)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.pc-tooltip')) onClose()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [onClose])

  const speak = () => {
    const u = new SpeechSynthesisUtterance(word)
    u.lang = lang
    speechSynthesis.speak(u)
  }

  return (
    <div
      className="pc-tooltip absolute bg-white border rounded shadow-md p-2 text-sm"
      style={{ top: y, left: x }}
    >
      <div className="flex flex-col items-center gap-1">
        <button onClick={speak} aria-label="play word">🔊</button>
        <span className="mt-1">{translation ?? '…'}</span>
      </div>
    </div>
  )
}
