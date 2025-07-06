import { defineConfig } from 'vitest/config'
import { join } from 'path'

export default defineConfig({
  root: __dirname,
  resolve: { alias: { '@': join(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['fake-indexeddb/auto'],
    poolOptions: { threads: { minThreads: 1, maxThreads: 1 } },
    coverage: process.env.CI ? undefined : { reporter: ['text', 'html'] }
  }
})
