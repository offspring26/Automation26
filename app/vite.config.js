import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project is served at https://offspring26.github.io/Automation26/
// so all built asset paths must be prefixed with the repo name.
export default defineConfig({
  plugins: [react()],
  base: '/Automation26/',
})
