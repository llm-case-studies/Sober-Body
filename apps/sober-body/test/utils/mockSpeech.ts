import { vi } from 'vitest'

export function installSpeechMocks() {
  globalThis.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: () => [{ name: 'MockVoice', lang: 'en-US' }],
  } as unknown as SpeechSynthesis
  ;(globalThis as Record<string, unknown>).SpeechSynthesisUtterance = function(this: SpeechSynthesisUtterance, text: string) {
    this.text = text
    this.lang = 'en-US'
  } as unknown as typeof SpeechSynthesisUtterance

  class MockRecognition extends EventTarget {
    lang = 'en-US'
    start = vi.fn(() => {
      queueMicrotask(() => {
        const evt = new Event('result') as SpeechRecognitionEvent
        Object.defineProperty(evt, 'results', {
          value: [[{ transcript: 'mock transcript', confidence: 1 }]],
        })
        this.onresult?.(evt)
        this.onend?.()
      })
    })
    stop = vi.fn()
  }
  ;(globalThis as Record<string, unknown>).SpeechRecognition = MockRecognition
  ;(globalThis as Record<string, unknown>).webkitSpeechRecognition = MockRecognition

  navigator.mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue({} as MediaStream),
  } as MediaDevices
}
