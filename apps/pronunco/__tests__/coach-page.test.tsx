import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
vi.mock('coach-ui', () => ({ PronunciationCoachUI: () => <div>Dummy deck</div> }));

import CoachPage from '../src/pages/CoachPage';
import { DeckProvider } from '../src/features/deck-context';
import { SettingsProvider } from '../src/features/core/settings-context';



describe('CoachPage', () => {
  it('renders first prompt line', async () => {
    console.log('▶ START: renders first prompt line');
    render(
      <MemoryRouter initialEntries={['/coach/d1']}>
        <SettingsProvider>
          <DeckProvider deckId="d1">
            <Routes>
              <Route path="/coach/:deckId" element={<CoachPage />} />
            </Routes>
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(document.body.innerHTML).toContain('Hola');
    console.log('✔ END:   renders first prompt line');
  });
});
