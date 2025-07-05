import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { join } from 'path'

export default defineConfig(({ mode }) => {
  const envDir = join(__dirname, '../../')
  const env = loadEnv(mode, envDir)
  console.log('PronunCo env vars:')
  for (const [key, value] of Object.entries(env)) {
    console.log(`  ${key}=${value}`)
  }
  return {
    envDir,
    plugins: [react()],
    server: { port: 5174 },
    test: { environment: 'jsdom' }
  }
})
