import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { createAppDB } from '../../../packages/core-storage/src/db';
import useDexieStore from '../src/hooks/useDexieStore';

const db = createAppDB('pronun');

async function reset() {
  await db.delete();
  await db.open();
}

describe('useDexieStore', () => {
  beforeEach(async () => {
    await reset();
  });

  it('returns snapshot and updates', async () => {
    await db.decks.add({ id: 'x', title: 'X', lang: 'en', updatedAt: 0 });
    const { result } = renderHook(() => useDexieStore(db.decks));
    await waitFor(() => result.current?.length === 1);
    expect(result.current?.[0]?.id).toBe("x");
  });
});
