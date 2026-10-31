import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // The article catalogue in dev. Same-origin to the browser, so the API's
      // CORS allow-list does not need localhost on it. See `apiUrl`.
      '/api': {
        target: 'https://api.staging.qyne.one',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    // Warn only on genuinely large chunks (the vendor split below is expected).
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /*
         * Split large, rarely-changing dependencies into their own chunks so
         * they're cached independently of app code and downloaded in parallel.
         * framer-motion is isolated because it's the heaviest single dep.
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils'))
              return 'motion'
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router'))
              return 'react'
          }
        },
      },
    },
  },
})
