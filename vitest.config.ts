import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate from vite.config.ts on purpose: the app config's MDX/Tailwind
// plugins exist to build .mdx content pages, which unit tests never touch
// (Phase 4 RTL tests render plain .tsx components directly, not through the
// MDX pipeline) -- pulling them in here would only add startup cost and an
// unrelated failure surface. react() alone covers the .tsx component tests.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@site': __dirname,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{mjs,cjs}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/viz/lib/**', 'src/data/**', 'scripts/lib/**'],
    },
  },
})
