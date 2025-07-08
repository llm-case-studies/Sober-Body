import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SettingsProvider } from '../../../../apps/sober-body/src/features/core/settings-context'
import { DeckProvider } from './features/deck-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <DeckProvider>
        <App />
      </DeckProvider>
    </SettingsProvider>
  </StrictMode>
)
