// examples/basic-demo/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@voice-ai/core': path.resolve(__dirname, '../../packages/core/src'),
      '@voice-ai/react': path.resolve(__dirname, '../../packages/react/src'),
      '@voice-ai/types': path.resolve(__dirname, '../../packages/types/src'),
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})