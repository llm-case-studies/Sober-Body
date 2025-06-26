import { render, fireEvent, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import SettingsModal from './SettingsModal'
import PronunciationModal from './PronunciationModal'
import { ModalProvider, useModal } from './ModalContext'
import { SettingsProvider } from '../features/core/settings-context'

function Tester() {
  const { active, open, close } = useModal()
  return (
    <div>
      <button onClick={() => open('settings')}>open settings</button>
      <button onClick={() => open('twister')}>open twister</button>
      <SettingsModal open={active === 'settings'} onClose={close} />
      <PronunciationModal open={active === 'twister'} onClose={close} />
    </div>
  )
}

describe('ModalProvider', () => {
  afterEach(() => cleanup())
  it('only one modal visible at a time', () => {
    render(
      <SettingsProvider>
        <ModalProvider>
          <Tester />
        </ModalProvider>
      </SettingsProvider>
    )
    fireEvent.click(screen.getByText('open settings'))
    expect(screen.getByText('Settings')).toBeTruthy()
    fireEvent.click(screen.getByText('open twister'))
    expect(screen.queryByText('Settings')).toBeNull()
    expect(screen.getByText('Tongue Twister')).toBeTruthy()
  })
})
