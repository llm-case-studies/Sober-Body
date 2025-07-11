// @vitest-environment jsdom
/// <reference types="vitest" />

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeckManager from '../src/components/DeckManager';
import { MemoryRouter } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks"; // Import after vi.mock

describe('DeckManager rendering', () => {
  it('renders the component', async () => {
    (useLiveQuery as vi.Mock).mockReturnValue([
      { id: 'g', title: 'Groceries', lang: 'en', updatedAt: 0 },
      { id: 'h', title: 'Household', lang: 'en', updatedAt: 0 }
    ]);

    act(() => {
      render(
        <MemoryRouter>
          <DeckManager />
        </MemoryRouter>
      );
    });
    screen.debug();
    await screen.findByText("Deck Manager (beta)");
  });
});