// tsconfig.app.json only includes "src", so tsc never sees
// tests/unit/setup.ts's `import '@testing-library/jest-dom/vitest'` (which
// is where the jest-dom matcher types actually get registered onto
// Vitest's Assertion interface). This file exists purely so tsc's "src"
// compilation includes that same module augmentation -- runtime behavior
// is unaffected either way, this only fixes `npm run typecheck`.
import '@testing-library/jest-dom'
