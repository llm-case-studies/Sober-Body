import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  envDir: join(__dirname, '../../'),
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
