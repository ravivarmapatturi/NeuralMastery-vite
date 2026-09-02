import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// @testing-library/react auto-registers afterEach(cleanup) for Jest, but
// not for Vitest -- without this, each test's rendered DOM accumulates in
// the shared jsdom document body across the whole file, and a later test's
// screen.getByText() ambiguously matches leftover nodes from an earlier one.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement IntersectionObserver at all (a known, long-standing
// gap -- it has no concept of layout/viewport geometry to compute
// intersections from). A minimal no-op stub is enough for components that
// construct one (e.g. TableOfContents's scroll-spy) to render without
// throwing; tests that need real intersection callbacks invoke them
// directly rather than relying on this stub to fire.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
// @ts-expect-error -- intentionally partial, see comment above
globalThis.IntersectionObserver = MockIntersectionObserver

// jsdom also doesn't implement window.matchMedia (it has no real rendering
// engine to evaluate media queries against) -- ThemeProvider's
// prefers-color-scheme fallback needs SOME implementation to not throw.
// Always reports no-match (light mode / no reduced-motion preference);
// tests that need a specific match should override window.matchMedia
// themselves rather than relying on this default.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList
}
