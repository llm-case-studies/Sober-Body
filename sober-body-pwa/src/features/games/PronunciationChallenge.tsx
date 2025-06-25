import React, { useState, useRef, useEffect } from 'react'
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

function randomPhrase(locale: string): TwisterPhrase {
  const opts = phrases.filter((p) => p.locale === locale)
  return opts[Math.floor(Math.random() * opts.length)]
}

export default function PronunciationChallenge({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState<'en-US' | 'pt-BR'>('en-US')
  const [phrase, setPhrase] = useState<TwisterPhrase>(randomPhrase('en-US'))
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const recRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef('')

  useEffect(() => {
    setPhrase(randomPhrase(lang))
  }, [lang])

  const play = () => {
    const u = new SpeechSynthesisUtterance(phrase.text)
    u.lang = phrase.locale
    speechSynthesis.speak(u)
  }

  const startRecording = async () => {
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
    recRef.current = r
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
      setRecording(false)
    }
    r.start()
    setRecording(true)
    setError(null)
    setTimeout(() => r.stop(), 4000)
  }

  const stopRecording = () => {
    recRef.current?.stop()
  }

  const next = () => {
    setPhrase(randomPhrase(lang))
    setTranscript('')
    setScore(null)
    setError(null)
    setRecording(false)
  }

  return (
    <div className="bg-white rounded-md p-4 w-72">
      <h3 className="font-semibold mb-2">Tongue Twister</h3>
      <div className="flex gap-2 mb-2">
        <button
          aria-label="en-US"
          onClick={() => setLang('en-US')}
          className={lang === 'en-US' ? 'font-bold' : ''}
        >
          🇺🇸 EN
        </button>
        <button
          aria-label="pt-BR"
          onClick={() => setLang('pt-BR')}
          className={lang === 'pt-BR' ? 'font-bold' : ''}
        >
          🇧🇷 PT
        </button>
      </div>
      <p className="mb-2">“{phrase.text}”</p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={play}
          aria-label="play"
          className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur"
        >
          ▶️ Play
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          aria-label="record"
          title={recording ? 'Stop & score' : 'Record'}
          className={`px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur flex items-center ${recording ? 'bg-red-600 text-white animate-pulse' : ''}`}
        >
          {recording ? '■ Stop' : '⏺ Record'}
        </button>
        <button
          onClick={next}
          aria-label="next"
          disabled={score === null}
          className={`px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur ${score === null ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          🔄 Next Twister
        </button>
        <button onClick={onClose} aria-label="close">✖︎</button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {score !== null && (
        <div className="mt-2 text-sm">
          <p>You said: “{transcript}”</p>
          <p>Score: {score}%</p>
          <p className="mt-1">
            {score >= 80
              ? '🔥 Nailed it!'
              : score >= 50
              ? 'Not bad, try again?'
              : '🍺 Maybe log that last drink…'}
          </p>
        </div>
      )}
    </div>
  )
}
