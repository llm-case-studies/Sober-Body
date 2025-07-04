import { defineConfig } from 'vitest/config'
import { join } from 'path'

export default defineConfig({
  resolve: { alias: { '@': join(__dirname, 'src') } },
  test: { environment: 'jsdom', setupFiles: ['fake-indexeddb/auto'] }
})
