import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ModalProvider } from './components/ModalContext'
import { DeckProvider } from './features/games/deck-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ModalProvider>
        <DeckProvider>
          <App />
        </DeckProvider>
      </ModalProvider>
    </BrowserRouter>
  </StrictMode>,
)
