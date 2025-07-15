import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { join, resolve } from 'path'

export default defineConfig(({ mode }) => {
  const envDir = join(__dirname, '../../')
  const env = loadEnv(mode, envDir)
  console.log('PronunCo env vars:')
  for (const [key, value] of Object.entries(env)) {
    console.log(`  ${key}=${value}`)
  }
  return {
    base: '/pc/',
    envDir,
    plugins: [react()],
    resolve: { alias: { '@': resolve(__dirname, 'src'), 'ui': resolve(__dirname, '../../packages/ui/src') } },
    server: { 
      port: 5174,
      fs: {
        allow: ['../../']
      }
    },
    test: { environment: 'jsdom' }
  }
})
