import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetDB } from '../src/db';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// close & delete every dexie DB opened during a test file
afterEach(async () => {
  resetDB();
  const names = await Dexie.getDatabaseNames();
  await Promise.allSettled(
    names.map(async (name) => {
      const db = new Dexie(name);
      await db.open().catch(() => {}); // may be closed already
      db.close();
      indexedDB.deleteDatabase(name);
    }),
  );
  cleanup();
});

// reset timers and mocks so leaks don't accumulate across suites
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});
