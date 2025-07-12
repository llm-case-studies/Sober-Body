import { defineConfig } from 'vitest/config';
import { join } from 'path';

export default defineConfig({
  exit: true,
  reporters: ['default', 'hanging-process'],
  teardownTimeout: 10_000,

  test: {
    environment: 'jsdom',      // UI tests still need the DOM
    threads: false,            // ← single process = no worker leak
    isolate: false,            // keep one jsdom; saves ~100 MB/run
    fileParallelism: false,    // serialise files; speed hit is tiny (<200 ms)
    hookTimeout: 10_000,
    setupFiles: ['./tests/setup-vitest.ts', './src/test/setupMocks.ts'],
    deps: { inline: [] },
    include: ['./__tests__/**/*.test.ts'],
  },

  root: __dirname,
  resolve: { alias: { '@': join(__dirname, 'src') } },
});
