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

const translationMock = vi.fn(() => 'bonjour')
vi.mock('../../../../packages/pronunciation-coach/src/useTranslation', () => ({
  default: (...args: unknown[]) => translationMock(...args)
}))

beforeEach(() => {
  installSpeechMocks()
  localStorage.clear()
  translationMock.mockClear()
})

afterEach(() => {
  cleanup()
})

describe('PronunciationCoachUI translation', () => {
  it('auto-unit translates on index advance', async () => {
    mockDecks.splice(0, mockDecks.length, { id: 't', title: 'T', lang: 'en', lines: ['one', 'two'], tags: [] })
    localStorage.setItem('pc_translateMode', 'auto-unit')
    function Wrapper() {
      const { setActiveDeck } = useDecks()
      useEffect(() => { setActiveDeck('t') }, [setActiveDeck])
      return <PronunciationCoachUI />
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
    const langSelect = screen.getAllByLabelText(/Translate to/i)[0]
    fireEvent.change(langSelect, { target: { value: 'fr' } })
    const before = translationMock.mock.calls.length
    const nextBtn = await screen.findByRole('button', { name: 'Next' })
    fireEvent.click(nextBtn)
    await Promise.resolve()
    expect(translationMock.mock.calls.length).toBeGreaterThan(before)
  })

  it('mode off prevents auto translate', () => {
    mockDecks.splice(0, mockDecks.length, { id: 't', title: 'T', lang: 'en', lines: ['x', 'y'], tags: [] })
    localStorage.setItem('pc_translateMode', 'off')
    function Wrapper() {
      const { setActiveDeck } = useDecks()
      useEffect(() => { setActiveDeck('t') }, [setActiveDeck])
      return <PronunciationCoachUI />
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
    const calls = translationMock.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(translationMock.mock.calls.length).toBe(calls)
  })

  it('Translate Now uses selection fallback', () => {
    mockDecks.splice(0, mockDecks.length, { id: 't', title: 'T', lang: 'en', lines: ['hello'], tags: [] })
    localStorage.setItem('pc_translateMode', 'off')
    const getSel = vi.fn(() => ({ toString: () => 'fox' }))
    Object.defineProperty(window, 'getSelection', { value: getSel })
    function Wrapper() {
      const { setActiveDeck } = useDecks()
      useEffect(() => { setActiveDeck('t') }, [setActiveDeck])
      return <PronunciationCoachUI />
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
    fireEvent.click(screen.getByRole('button', { name: /Translate Now/i }))
    expect(translationMock.mock.calls.at(-1)?.[0]).toBe('fox')
    getSel.mockReturnValue({ toString: () => '' })
    fireEvent.click(screen.getByRole('button', { name: /Translate Now/i }))
    expect(translationMock.mock.calls.at(-1)?.[0]).toBe('She sells seashells')
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

describe('PronunciationCoachUI grammar button', () => {
  it('hidden when no brief', async () => {
    mockDecks.splice(0, mockDecks.length, { id: 'g', title: 'G', lang: 'en', lines: ['one'], tags: [] })
    function Wrapper() {
      const { setActiveDeck } = useDecks()
      useEffect(() => { setActiveDeck('g') }, [setActiveDeck])
      return <PronunciationCoachUI />
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
    await screen.findByText('one')
    expect(screen.queryByRole('button', { name: /Grammar/i })).toBeNull()
  })
})

