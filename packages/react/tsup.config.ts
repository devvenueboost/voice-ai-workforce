// packages/react/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: process.env.NODE_ENV === 'production',
  target: 'es2020',
  external: ['react', 'react-dom', '@voice-ai-workforce/core', '@voice-ai-workforce/types'],
  banner: {
    js: '/* Voice AI Workforce React - Built with ❤️ by Griseld Gerveni, CTO of VenueBoost Inc. */',
  },
})