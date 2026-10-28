import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Vendor split: framework/runtime chunks cache independently of app code.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|scheduler|react-router)/.test(id)) return 'vendor-react'
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)/.test(id)) return 'vendor-motion'
          if (/node_modules\/@tanstack\//.test(id)) return 'vendor-query'
          if (/node_modules\/(react-markdown|remark|mdast|micromark|hast|unist|unified|vfile|mdurl|decode|character-entities|property-information|space-separated|comma-separated|devlop|bail|trough|is-plain-obj|extend|ccount|escape-string|markdown-table|zwitch)/.test(id))
            return 'vendor-markdown'
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // pin the zone so date-formatting assertions are deterministic anywhere
    env: { TZ: 'UTC' },
  },
})
