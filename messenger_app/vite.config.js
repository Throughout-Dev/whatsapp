import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this configuration to lock Vite into this directory
  root: process.cwd(),
  server: {
    fs: {
      // Prevent serving files from parent directories
      strict: true,
    },
  },
})
