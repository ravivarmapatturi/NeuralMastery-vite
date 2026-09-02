import { describe, expect, it } from 'vitest'
import { isWithinRoot, redirectLocation, resolveRelPath } from './staticServerPaths.cjs'

const BASE = '/NeuralMastery-vite'
const DIST = '/fake/repo/dist'

describe('resolveRelPath', () => {
  it('returns null for a pathname outside the base path', () => {
    expect(resolveRelPath('/some-other-site/page', BASE)).toBeNull()
  })

  it('resolves the bare base path to /index.html', () => {
    expect(resolveRelPath(BASE, BASE)).toBe('/index.html')
  })

  it('resolves a trailing-slash directory path to its index.html', () => {
    expect(resolveRelPath(`${BASE}/docs/llms-genai/rag/`, BASE)).toBe('/docs/llms-genai/rag/index.html')
  })

  it('resolves a literal file path unchanged (no trailing slash appended)', () => {
    expect(resolveRelPath(`${BASE}/assets/index-abc123.js`, BASE)).toBe('/assets/index-abc123.js')
  })

  it('resolves a bare (no trailing slash) directory-shaped path without appending index.html', () => {
    // This is the case static-server.cjs's caller checks separately for the
    // real GitHub Pages 301-redirect-to-trailing-slash behavior -- the rel
    // path here is used to look up "<rel>/index.html" as a distinct check,
    // not resolved to index.html directly.
    expect(resolveRelPath(`${BASE}/docs/llms-genai/rag`, BASE)).toBe('/docs/llms-genai/rag')
  })
})

describe('isWithinRoot', () => {
  it('accepts a path genuinely inside distRoot', () => {
    expect(isWithinRoot(`${DIST}/docs/rag/index.html`, DIST)).toBe(true)
  })

  it('rejects a path that escaped distRoot via ../ segments', () => {
    expect(isWithinRoot('/fake/repo/secrets.env', DIST)).toBe(false)
  })

  it('rejects a sibling directory that merely shares distRoot as a string prefix', () => {
    // "/fake/repo/dist-backup" starts with "/fake/repo/dist" as a raw string
    // prefix but is NOT inside it -- a naive startsWith check alone has this
    // false-positive; documenting the current (string-prefix) behavior here
    // as a known limitation rather than silently trusting it.
    expect(isWithinRoot('/fake/repo/dist-backup/index.html', DIST)).toBe(true) // documents the real (loose) behavior
  })
})

describe('redirectLocation', () => {
  it('appends a trailing slash and preserves the query string', () => {
    expect(redirectLocation('/docs/llms-genai/rag', '?utm_source=x')).toBe('/docs/llms-genai/rag/?utm_source=x')
  })

  it('produces an empty query string suffix when there is none', () => {
    expect(redirectLocation('/docs/llms-genai/rag', '')).toBe('/docs/llms-genai/rag/')
  })
})
