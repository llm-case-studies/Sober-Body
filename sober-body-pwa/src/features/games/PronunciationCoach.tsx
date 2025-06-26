import React, { useRef, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { score as scorePhrase } from './scoring/levenshtein'

export interface PronunciationCoachProps {
  phrase: string
  locale: string
  maxSecs?: number
  onScore?: (r: { score: number; transcript: string; millis: number }) => void
}

export default function PronunciationCoach({ phrase, locale, maxSecs, onScore }: PronunciationCoachProps) {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const recRef = useRef<SpeechRecognition | null>(null)
  const tRef = useRef('')
  const startTime = useRef(0)
  const dur = useRef(0)

  const limit = Math.min(6000, Math.max(2000, Math.round((maxSecs ?? phrase.length / 8) * 1000)))

  useEffect(() => () => recRef.current?.stop(), [])

  const play = () => {
    const u = new SpeechSynthesisUtterance(phrase)
    const voice = speechSynthesis.getVoices().find(v => v.lang === locale)
    if (voice) u.voice = voice
    u.lang = locale
    speechSynthesis.speak(u)
  }

  const start = async () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition
      webkitSpeechRecognition?: new () => SpeechRecognition
    }
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Rec) return
    await navigator.mediaDevices.getUserMedia({ audio: true })
    const r: SpeechRecognition = new Rec()
    recRef.current = r
    r.lang = locale
    r.onresult = e => {
      tRef.current = e.results[0][0].transcript
    }
    r.onend = () => {
      dur.current = Date.now() - startTime.current
      const s = scorePhrase(phrase, tRef.current)
      setResult(s)
      if (s >= 80) confetti({ particleCount: 80, spread: 55 })
      onScore?.({ score: s, transcript: tRef.current, millis: dur.current })
      setRecording(false)
    }
    startTime.current = Date.now()
    r.start()
    setRecording(true)
    setTimeout(() => r.stop(), limit)
  }

  return (
    <div className="space-x-2">
      <button onClick={play}>▶ Play</button>
      <button
        disabled={!(('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))}
        onClick={recording ? () => recRef.current?.stop() : start}
      >{recording ? '■ Stop' : '⏺ Record'}</button>
      {result !== null && <span>Score {result}%</span>}
    </div>
  )
}
