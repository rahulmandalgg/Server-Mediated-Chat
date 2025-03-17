import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Allow access from any IP
    port: 3000,  // Change from 5173 to 3000
    strictPort: true,  // Prevent auto-changing ports
    open: true  // Auto-open browser on start
  }
})
