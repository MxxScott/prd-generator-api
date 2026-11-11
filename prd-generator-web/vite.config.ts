import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // This forces Vite to strictly use ONE copy of React, killing the useRef error
    dedupe: ['react', 'react-dom']
  }
})