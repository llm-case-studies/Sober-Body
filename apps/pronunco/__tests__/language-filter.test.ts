import { describe, it, expect } from 'vitest';
import { getLanguages } from '../src/features/get-languages';
import type { Deck } from '../src/types';

describe('language filter', () => {
  it('gets unique sorted languages', () => {
    const decks: Deck[] = [
      { id: '1', title: 'Taxi EN', lang: 'en', lines: ['a'], tags: [] },
      { id: '2', title: 'Taxi ES', lang: 'es', lines: ['b'], tags: [] },
      { id: '3', title: 'Taxi EN2', lang: 'en', lines: ['c'], tags: [] }
    ];
    expect(getLanguages(decks)).toEqual(['en', 'es']);
  });
});
