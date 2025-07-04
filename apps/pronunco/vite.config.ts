import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { join } from 'path'

export default defineConfig({
  envDir: join(__dirname, '../../'),
  plugins: [react()],
  server: { port: 5174 },
  test: { environment: 'jsdom' }
})
