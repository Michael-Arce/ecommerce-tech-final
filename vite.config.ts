import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: 'src/routes', generatedRouteTree: 'src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/server/**'],
    alias: {
      '@/app':      '/src/app',
      '@/pages':    '/src/pages',
      '@/widgets':  '/src/widgets',
      '@/features': '/src/features',
      '@/entities': '/src/entities',
      '@/shared':   '/src/shared',
      '@/routes':   '/src/routes',
    },
  },
  resolve: {
    alias: {
      '@/app': resolve(__dirname, 'src/app'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/widgets': resolve(__dirname, 'src/widgets'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/entities': resolve(__dirname, 'src/entities'),
      '@/shared': resolve(__dirname, 'src/shared'),
      '@/routes': resolve(__dirname, 'src/routes'),
    },
  },
})
