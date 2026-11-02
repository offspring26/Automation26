import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// Project is served at https://offspring26.github.io/Automation26/
// so all built asset paths must be prefixed with the repo name.
export default defineConfig({
  plugins: [react()],
  base: '/Automation26/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/d3') || id.includes('node_modules/victory-vendor')) {
            return 'vendor-d3'
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts'
          }
        },
      },
    },
  },
})
