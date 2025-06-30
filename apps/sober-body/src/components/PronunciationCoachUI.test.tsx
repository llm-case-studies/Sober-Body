import { render, fireEvent, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useEffect } from 'react'
import 'fake-indexeddb/auto'
import PronunciationCoachUI from './PronunciationCoachUI'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '../features/core/settings-context'
import { DeckProvider, useDecks } from '../features/games/deck-context'
import { installSpeechMocks } from '../../test/utils/mockSpeech'

import type { Deck } from '../features/games/deck-types'

const mockDecks: Deck[] = []

vi.mock('../features/games/deck-storage', () => ({
  loadDecks: vi.fn(async () => mockDecks),
  saveDecks: vi.fn(),
}))

vi.mock('../../../../packages/pronunciation-coach/src/useTranslation', () => ({
  default: vi.fn(() => 'bonjour')
}))

beforeEach(() => {
  installSpeechMocks()
})

afterEach(() => {
  cleanup()
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
    fireEvent.click(screen.getAllByRole('button', { name: /Hear translation/i })[0])
    const speakMock = speechSynthesis.speak as unknown as vi.Mock
    const utter = speakMock.mock.calls[speakMock.mock.calls.length - 1][0] as SpeechSynthesisUtterance
    expect(utter.rate).toBe(0.7)
  })
})

describe('PronunciationCoachUI deck switching', () => {
  it('resets index when active deck changes', async () => {
    mockDecks.splice(0, mockDecks.length,
      { id: 'a', title: 'A', lang: 'pt-BR', lines: ['a one', 'a two'], tags: [] },
      { id: 'b', title: 'B', lang: 'fr-FR', lines: ['b one', 'b two'], tags: [] },
    )

    function Wrapper() {
      const { setActiveDeck } = useDecks()
      useEffect(() => { setActiveDeck('a') }, [setActiveDeck])
      return (
        <>
          <button onClick={() => setActiveDeck('b')} data-testid="swap">swap</button>
          <PronunciationCoachUI />
        </>
      )
    }

    render(
      <MemoryRouter>
        <SettingsProvider>
          <DeckProvider>
            <Wrapper />
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    )

    await screen.findAllByText('a one')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByTestId('swap'))
    await screen.findAllByText('b one')
    const prev = screen.getByRole('button', { name: 'Prev' }) as HTMLButtonElement
    expect(prev.disabled).toBe(true)
    const dropdown = screen.getAllByRole('combobox')[1] as HTMLSelectElement
    expect(dropdown.value).toBe('fr-FR')
  })
})

