import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ babel: { plugins: [['babel-plugin-react-compiler']],}, }), tailwindcss(), ],
  root: '.', // Racine relative au dossier client
  base: '/', // Pour Vercel
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://rappelbot.onrender.com', // Votre backend sur Render
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
