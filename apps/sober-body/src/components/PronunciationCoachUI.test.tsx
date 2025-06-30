import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import PronunciationCoachUI from './PronunciationCoachUI'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '../features/core/settings-context'
import { DeckProvider } from '../features/games/deck-context'
import { installSpeechMocks } from '../../test/utils/mockSpeech'

vi.mock('../../../../packages/pronunciation-coach/src/useTranslation', () => ({
  default: vi.fn(() => 'bonjour')
}))

beforeEach(() => {
  installSpeechMocks()
})

describe('PronunciationCoachUI translation', () => {
  it('translates selected sentence to French', async () => {
    const getSelection = vi.fn(() => ({ toString: () => 'She sells seashells' }))
    Object.defineProperty(window, 'getSelection', { value: getSelection })
    render(
      <MemoryRouter>
        <SettingsProvider>
          <DeckProvider>
            <PronunciationCoachUI />
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    )
    const langSelect = screen.getAllByLabelText(/Translate to/i)[0]
    fireEvent.change(langSelect, { target: { value: 'fr' } })
    const heading = screen.getAllByRole('heading')[0]
    fireEvent.mouseUp(heading)
    expect(await screen.findByText('bonjour')).toBeTruthy()
  })

  it('speaks slower when slow mode enabled', async () => {
    const getSelection = vi.fn(() => ({ toString: () => 'She sells seashells' }))
    Object.defineProperty(window, 'getSelection', { value: getSelection })
    render(
      <MemoryRouter>
        <SettingsProvider>
          <DeckProvider>
            <PronunciationCoachUI />
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    )
    const langSelect = screen.getAllByLabelText(/Translate to/i)[0]
    fireEvent.change(langSelect, { target: { value: 'fr' } })
    fireEvent.mouseUp(screen.getAllByRole('heading')[0])
    await screen.findAllByText('bonjour')
    fireEvent.click(screen.getAllByLabelText(/Slow speak/i)[0])
    await Promise.resolve()
    fireEvent.click(screen.getAllByRole('button', { name: '🔊' })[0])
    const speakMock = speechSynthesis.speak as unknown as vi.Mock
    const utter = speakMock.mock.calls[speakMock.mock.calls.length - 1][0] as SpeechSynthesisUtterance
    expect(utter.rate).toBe(0.7)
  })
})

