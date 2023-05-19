import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pluginRewriteAll from 'vite-plugin-rewrite-all'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),pluginRewriteAll()],
  server : {
    host: "0.0.0.0",
    port: 8080
  }
})
