import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateBAC, gramsFromDrink, widmark } from '../src/features/core/bac.ts';

const physiology = { weightKg: 70, sex: 'm' } as const;

test('future drinks do not affect current BAC', () => {
  const now = new Date();
  const pastDrink = { volumeMl: 330, abv: 0.05, date: new Date(now.getTime() - 2 * 60 * 60 * 1000) };
  const futureDrink = { volumeMl: 330, abv: 0.05, date: new Date(now.getTime() + 60 * 60 * 1000) };

  const expected = widmark(gramsFromDrink(pastDrink), physiology, 2);
  const actual = estimateBAC([pastDrink, futureDrink], physiology, now);

  assert.ok(Math.abs(actual - expected) < 1e-9);
});
