import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import PronunciationCoachUI from './PronunciationCoachUI'
import { SettingsProvider } from '../features/core/settings-context'
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
      <SettingsProvider>
        <PronunciationCoachUI />
      </SettingsProvider>
    )
    fireEvent.change(screen.getByLabelText(/Translate to/i), { target: { value: 'fr' } })
    fireEvent.doubleClick(screen.getByRole('heading'))
    expect(await screen.findByText('bonjour')).toBeTruthy()
  })
})

