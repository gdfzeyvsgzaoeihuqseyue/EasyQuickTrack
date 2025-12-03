import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: {
      timeout: 30000 // Augmenter le timeout HMR à 30 secondes
    }
  },
  optimizeDeps: {
    exclude: [] // Peut être rempli si nécessaire
  }
})
