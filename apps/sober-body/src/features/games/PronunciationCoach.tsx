import React, { useRef, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { score as scorePhrase } from './scoring/levenshtein'

export interface PronunciationCoachProps {
  phrase: string
  locale: string
  maxSecs?: number
  onScore?: (r: { score: number; transcript: string; millis: number }) => void
  onAudioRecorded?: (audioBlob: Blob) => void
}

export function usePronunciationCoach({ phrase, locale, maxSecs, onScore, onAudioRecorded }: PronunciationCoachProps) {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const recRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const tRef = useRef('')
  const startTime = useRef(0)
  const dur = useRef(0)

  const limit = Math.min(6000, Math.max(2000, Math.round((maxSecs ?? phrase.length / 8) * 1000)))

  useEffect(() => () => {
    recRef.current?.stop()
    mediaRecorderRef.current?.stop()
  }, [])

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

    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // Set up MediaRecorder for audio capture (if available)
    audioChunksRef.current = []
    let mediaRecorder: MediaRecorder | null = null
    let mimeType = 'audio/wav' // default
    
    if (typeof MediaRecorder !== 'undefined') {
      // Test various formats for Azure compatibility
      const formats = [
        'audio/wav',
        'audio/webm;codecs=pcm',
        'audio/ogg;codecs=opus',
        'audio/webm;codecs=opus'
      ];
      
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          mimeType = format;
          break;
        }
      }
      
      console.log('Selected audio format:', mimeType);
      console.log('Format support test:', formats.map(f => ({ format: f, supported: MediaRecorder.isTypeSupported(f) })));
      
      mediaRecorder = new MediaRecorder(stream, { mimeType })
    }
    mediaRecorderRef.current = mediaRecorder
    
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        // Create audio blob and pass to callback
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        onAudioRecorded?.(audioBlob)
      }
    }

    // Set up SpeechRecognition for transcription
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
      
      // Stop MediaRecorder when speech recognition ends
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      
      // Stop the stream (if it has getTracks method)
      if (stream && typeof stream.getTracks === 'function') {
        stream.getTracks().forEach(track => track.stop())
      }
    }

    // Start both recording systems
    startTime.current = Date.now()
    if (mediaRecorder) {
      mediaRecorder.start()
    }
    r.start()
    setRecording(true)
    
    // Auto-stop after time limit
    setTimeout(() => {
      r.stop()
    }, limit)
  }

  const stop = () => {
    recRef.current?.stop()
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  return { play, start, stop, recording, result }
}

export default function PronunciationCoach(props: PronunciationCoachProps) {
  const coach = usePronunciationCoach(props)

  return (
    <div className="space-x-2">
      <button onClick={coach.play}>▶ Play</button>
      <button
        disabled={!(('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))}
        onClick={coach.recording ? coach.stop : coach.start}
      >{coach.recording ? '■ Stop' : '⏺ Record'}</button>
      {coach.result !== null && <span>Score {coach.result}%</span>}
    </div>
  )
}
