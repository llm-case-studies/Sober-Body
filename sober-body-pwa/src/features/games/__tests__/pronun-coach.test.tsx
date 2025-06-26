import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import PronunciationCoach from '../PronunciationCoach'
import { installSpeechMocks } from '../../../../test/utils/mockSpeech.ts'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

vi.useFakeTimers()

describe('PronunciationCoach', () => {
  beforeEach(() => {
    installSpeechMocks()
  })
  afterEach(() => {
    vi.clearAllTimers()
    cleanup()
  })

  it('counts perfect score', async () => {
    const onScore = vi.fn()
    const { getByText } = render(
      <PronunciationCoach phrase="mock transcript" locale="en-US" onScore={onScore} />
    )
    fireEvent.click(getByText('⏺ Record'))
    await vi.runAllTimersAsync()
    await Promise.resolve()
    await vi.runAllTicks()
    expect(onScore).toHaveBeenCalled()
    expect(onScore.mock.calls[0][0].score).toBe(100)
  })

  it('clamps recording to maxSecs', async () => {
    const onScore = vi.fn()
    render(
      <PronunciationCoach phrase="a very long phrase here" locale="en-US" maxSecs={2} onScore={onScore} />
    )
    fireEvent.click(document.querySelector('button:nth-child(2)')!)
    await vi.runAllTimersAsync()
    await Promise.resolve()
    await vi.runAllTicks()
    expect(onScore.mock.calls[0][0].millis).toBeLessThanOrEqual(2000)
  })

  it('disables record when API missing', () => {
    delete (globalThis as Record<string, unknown>).SpeechRecognition
    delete (globalThis as Record<string, unknown>).webkitSpeechRecognition
    const { getByText } = render(
      <PronunciationCoach phrase="x" locale="en-US" />
    )
    const btn = getByText('⏺ Record') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
