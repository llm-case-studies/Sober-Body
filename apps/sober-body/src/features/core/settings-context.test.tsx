import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { DEFAULT_BETA } from './bac'
import { SettingsProvider, useSettings } from './settings-context'
vi.mock('./storage', () => {
  const store: { settings?: unknown } = {}
  return {
    loadSettings: vi.fn(() => Promise.resolve(store.settings)),
    saveSettings: vi.fn((val: unknown) => {
      store.settings = val
      return Promise.resolve()
    })
  }
})
function WeightDisplay() {
  const { settings } = useSettings()
  return <div data-testid="weight">{settings.weightKg}</div>
}
function ChangeButton() {
  const { setSettings } = useSettings()
  return <button onClick={() => setSettings(s => ({ ...s, weightKg: 80 }))}>Change</button>
}
describe('SettingsProvider persistence', () => {
  afterEach(() => cleanup())
  it('persists changes via storage module', async () => {
    const storage = await import('./storage')
    const first = render(
      <SettingsProvider>
        <ChangeButton />
        <WeightDisplay />
      </SettingsProvider>
    )
    await waitFor(() => expect(storage.loadSettings).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: /change/i }))
    await waitFor(() => {
      expect(storage.saveSettings).toHaveBeenCalledWith({ weightKg: 80, sex: 'm', beta: DEFAULT_BETA, nativeLang: 'en', locale: 'en', slowSpeech: false })
    })
    first.unmount()
    render(
      <SettingsProvider>
        <WeightDisplay />
      </SettingsProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('weight').textContent).toBe('80')
    })
  })
})
