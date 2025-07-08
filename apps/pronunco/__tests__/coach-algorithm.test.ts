import { describe, it, expect } from 'vitest';
import { pickNextCard } from '../src/utils/coach-algorithm';

describe('pickNextCard', () => {
  it('chooses lowest accuracy first', () => {
    const deck = [
      { id: 1, attempts: 10, correct: 3 },
      { id: 2, attempts: 2, correct: 2 },
      { id: 3, attempts: 5, correct: 1 },
    ];
    expect(pickNextCard(deck).id).toBe(3);
  });
});
