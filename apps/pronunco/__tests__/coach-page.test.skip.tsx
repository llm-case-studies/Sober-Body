// Mock Azure Speech package FIRST (before any imports)
vi.mock('../../azure-speech/src', () => ({
  useAzurePronunciation: vi.fn(),
  useAzureBudget: () => ({
    budgetExceeded: false,
    todaySpending: 0,
    remainingBudget: 3,
    addUsageEntry: vi.fn(),
    usageEntries: []
  })
}));

// Mock coach-ui package completely
vi.mock('coach-ui', () => ({ 
  PronunciationCoachUI: () => <h2>She sells seashells</h2>
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import CoachPage from '../src/pages/CoachPage';
import { DeckProvider } from '../../sober-body/src/features/games/deck-context';
import { SettingsProvider } from '../src/features/core/settings-context';



describe('CoachPage', () => {
  it('renders coach page with deck content', async () => {
    render(
      <MemoryRouter initialEntries={['/coach/d1']}>
        <SettingsProvider>
          <DeckProvider>
            <Routes>
              <Route path="/coach/:deckId" element={<CoachPage />} />
            </Routes>
          </DeckProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(document.body.innerHTML).toContain('She sells seashells');
  });
});
