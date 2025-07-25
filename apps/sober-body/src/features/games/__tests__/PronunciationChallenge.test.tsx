import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import PronunciationChallenge from '../PronunciationChallenge'
import { phrases } from '../twister-phrases'

let usedLang = ''

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

class MockSpeechRecognition {
  lang = ''
  onresult: ((e: SpeechRecognitionEvent) => void) | null = null
  onend: (() => void) | null = null
  start() {
    usedLang = this.lang
    this.onresult?.({ results: [[{ transcript: phrases[0].text }]] })
    this.onend?.()
  }
  stop() {}
}

afterEach(() => {
  vi.restoreAllMocks()
  delete (globalThis as Record<string, unknown>).SpeechRecognition
  delete (globalThis as Record<string, unknown>).webkitSpeechRecognition
  ;(navigator as unknown as Record<string, unknown>).permissions = undefined
  cleanup()
})

describe('PronunciationChallenge', () => {
  it('scores 100% for exact match', async () => {
    globalThis.SpeechRecognition = MockSpeechRecognition as unknown as typeof SpeechRecognition
    ;(globalThis as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition =
      MockSpeechRecognition as unknown as typeof SpeechRecognition
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<PronunciationChallenge onClose={() => {}} />)
    fireEvent.click(screen.getByLabelText('record'))
    expect(await screen.findByText(/Score: 100%/)).toBeTruthy()
  })

  it('shows error when speech recognition is unavailable', async () => {
    render(<PronunciationChallenge onClose={() => {}} />)
    fireEvent.click(screen.getByLabelText('record'))
    expect(await screen.findByText(/Speech recognition is unavailable/i)).toBeTruthy()
  })

  it('shows error when microphone permission denied', async () => {
    globalThis.SpeechRecognition = MockSpeechRecognition as unknown as typeof SpeechRecognition
    ;(globalThis as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition =
      MockSpeechRecognition as unknown as typeof SpeechRecognition
    ;(navigator as unknown as Record<string, unknown>).permissions = {
      query: vi.fn().mockResolvedValue({ state: 'denied' }),
    }
    render(<PronunciationChallenge onClose={() => {}} />)
    fireEvent.click(screen.getByLabelText('record'))
    expect(await screen.findByText(/Microphone access denied/i)).toBeTruthy()
  })

  it('enables Next button after scoring', async () => {
    globalThis.SpeechRecognition = MockSpeechRecognition as unknown as typeof SpeechRecognition
    ;(globalThis as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition =
      MockSpeechRecognition as unknown as typeof SpeechRecognition
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<PronunciationChallenge onClose={() => {}} />)
    const nextBtn = screen.getByLabelText('next')
    expect(nextBtn.hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByLabelText('record'))
    await screen.findByText(/Score: 100%/)
    expect(nextBtn.hasAttribute('disabled')).toBe(false)
  })

  it('uses pt-BR when PT button clicked', async () => {
    globalThis.SpeechRecognition = MockSpeechRecognition as unknown as typeof SpeechRecognition
    ;(globalThis as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition =
      MockSpeechRecognition as unknown as typeof SpeechRecognition
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<PronunciationChallenge onClose={() => {}} />)
    fireEvent.click(screen.getByLabelText('pt-BR'))
    fireEvent.click(screen.getByLabelText('record'))
    expect(usedLang).toBe('pt-BR')
  })
})
