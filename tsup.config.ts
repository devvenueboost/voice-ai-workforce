// tsup.config.ts (shared across packages)
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
  external: ['react', 'react-dom'],
  banner: {
    js: '/* Voice AI Workforce - Built with ❤️ by Griseld Gerveni, CTO of VenueBoost Inc. */',
  },
})