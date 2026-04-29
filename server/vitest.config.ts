import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode ?? 'test', process.cwd(), '')
  return {
    test: {
      globals: true,
      environment: 'node',
      env,
    },
  }
})
