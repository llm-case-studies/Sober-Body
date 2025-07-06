import { defineConfig } from 'vitest/config'
import { join } from 'path'

export default defineConfig({
  root: __dirname,
  resolve: { alias: { '@': join(__dirname, 'src') } },
  test: {
    environment: 'happy-dom',
    setupFiles: ['fake-indexeddb/auto'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
})
