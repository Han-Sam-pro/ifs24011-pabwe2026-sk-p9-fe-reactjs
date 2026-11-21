import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
  // "npm start" di hosting (Delcom nodejs-reactjs): sajikan hasil build di $PORT.
  // allowedHosts: true agar domain *.s1if.cloud tidak ditolak oleh Vite.
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  // Dipakai "bun run start" / "npm start" di hosting: melayani hasil build (dist)
  // dengan SPA fallback pada PORT dari platform (mis. 6638).
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
    allowedHosts: true,
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js', 'src/**/*.test.{js,jsx}'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
