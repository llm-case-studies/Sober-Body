import React, { useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { phrases, type TwisterPhrase } from './twister-phrases'
import { emit } from '../core/bus'

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i)
  for (let i = 1; i <= b.length; i++) {
    let prev = i - 1
    dp[0] = i
    for (let j = 1; j <= a.length; j++) {
      const temp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[j - 1] === b[i - 1] ? 0 : 1))
      prev = temp
    }
  }
  return dp[a.length]
}

function randomPhrase(): TwisterPhrase {
  return phrases[Math.floor(Math.random() * phrases.length)]
}

export default function PronunciationChallenge({ onClose }: { onClose: () => void }) {
  const [phrase, setPhrase] = useState<TwisterPhrase>(randomPhrase())
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const transcriptRef = useRef('')

  const play = () => {
    const u = new SpeechSynthesisUtterance(phrase.text)
    u.lang = phrase.locale
    speechSynthesis.speak(u)
  }

  const start = async () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition
      webkitSpeechRecognition?: new () => SpeechRecognition
    }
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Rec) {
      console.warn('Speech recognition not supported')
      setError('Speech recognition is unavailable.')
      return
    }
    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        })
        if (status.state === 'denied') {
          setError('Microphone access denied.')
          return
        }
      } catch {
        /* ignore */
      }
    }
    const r: SpeechRecognition = new Rec()
    r.lang = phrase.locale
    r.onresult = (e: SpeechRecognitionEvent) => {
      transcriptRef.current = e.results[0][0].transcript
      setTranscript(transcriptRef.current)
    }
    r.onend = () => {
      const dist = levenshtein(transcriptRef.current.toLowerCase(), phrase.text.toLowerCase())
      const maxLen = Math.max(transcriptRef.current.length, phrase.text.length)
      const s = Math.round((1 - dist / maxLen) * 100)
      setScore(s)
      emit({ topic: 'PRONUN_SCORE', payload: { phrase: phrase.text, transcript: transcriptRef.current, score: s }, profile: 'standard' })
      if (s >= 80) confetti({ particleCount: 80, spread: 60 })
    }
    r.start()
    setError(null)
    setTimeout(() => r.stop(), 4000)
  }

  const next = () => {
    setPhrase(randomPhrase())
    setTranscript('')
    setScore(null)
  }

  return (
    <div className="bg-white rounded-md p-4 w-72">
      <h3 className="font-semibold mb-2">Tongue Twister</h3>
      <p className="mb-2">“{phrase.text}”</p>
      <div className="flex gap-2 mb-2">
        <button onClick={play} aria-label="play">▶️</button>
        <button onClick={start} aria-label="record">🎙️</button>
        <button onClick={onClose} aria-label="close">✖︎</button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {score !== null && (
        <div className="mt-2 text-sm">
          <p>Heard: {transcript}</p>
          <p>Score: {score}%</p>
          <button className="mt-2" onClick={next}>Next</button>
        </div>
      )}
    </div>
  )
}
