import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// CHANGE THIS: The name of your repository exactly as it appears on GitHub
const REPO_NAME = 'Legacy-Build' 

export default defineConfig({
  plugins: [react()],
  // This ensures assets look for "./assets" instead of "/assets"
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
