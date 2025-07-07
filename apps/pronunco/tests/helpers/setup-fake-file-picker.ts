import { beforeEach, afterEach, vi } from 'vitest';

/** Sets up fake timers + resolved File System Access API mocks. */
export function useFakeFilePicker() {
  const dummyFile = new File(['foo'], 'dummy.txt', { type: 'text/plain' });
  const dummyHandle: FileSystemFileHandle = {
    kind: 'file',
    name: dummyFile.name,
  } as unknown as FileSystemFileHandle;

  beforeEach(() => {
    // 1) Fake timers so we control polling intervals
    vi.useFakeTimers();

    // 2) Stub both picker APIs with resolved promises
    vi.stubGlobal('showOpenFilePicker', vi.fn(() => Promise.resolve([dummyHandle])));
    vi.stubGlobal('showDirectoryPicker', vi.fn(() => Promise.resolve(dummyHandle as unknown as FileSystemDirectoryHandle)));
  });

  afterEach(async () => {
    // Flush and clear *all* pending timers
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();

    // Restore any other mocks to avoid leakage
    vi.restoreAllMocks();
  });
}
