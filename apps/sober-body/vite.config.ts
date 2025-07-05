import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = join(__dirname, '../../')
  const env = loadEnv(mode, envDir)
  console.log('Sober-Body env vars:')
  for (const [key, value] of Object.entries(env)) {
    console.log(`  ${key}=${value}`)
  }
  return {
    // 👉  point two levels up to the repo root
    envDir,
    plugins: [react()],
    test: {
      environment: 'jsdom',
    },
  }
})
