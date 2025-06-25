import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import PronunciationChallenge from '../PronunciationChallenge'
import { phrases } from '../twister-phrases'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

class MockSpeechRecognition {
  lang = ''
  onresult: ((e: SpeechRecognitionEvent) => void) | null = null
  onend: (() => void) | null = null
  start() {
    this.onresult?.({ results: [[{ transcript: phrases[0].text }]] })
    this.onend?.()
  }
  stop() {}
}

globalThis.SpeechRecognition = MockSpeechRecognition as unknown as typeof SpeechRecognition
;(globalThis as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition = MockSpeechRecognition as unknown as typeof SpeechRecognition

afterEach(() => vi.restoreAllMocks())

describe('PronunciationChallenge', () => {
  it('scores 100% for exact match', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<PronunciationChallenge onClose={() => {}} />)
    fireEvent.click(screen.getByLabelText('record'))
    expect(await screen.findByText(/Score: 100%/)).toBeTruthy()
  })
})
