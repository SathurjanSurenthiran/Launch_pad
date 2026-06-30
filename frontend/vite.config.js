import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindCSS from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindCSS()],
  server: {
    port: 5173,
    strictPort: true
  }
})