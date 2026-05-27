import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin portal runs on port 5174
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
})
