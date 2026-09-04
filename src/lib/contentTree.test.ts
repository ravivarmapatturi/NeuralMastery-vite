import { describe, expect, it } from 'vitest'
import { normalizeRoute, getPageByRoute, getFlatPages } from './contentTree'

describe('normalizeRoute', () => {
  it('strips a single trailing slash', () => {
    expect(normalizeRoute('/docs/foo/')).toBe('/docs/foo')
  })

  it('leaves a route with no trailing slash unchanged', () => {
    expect(normalizeRoute('/docs/foo')).toBe('/docs/foo')
  })

  it('leaves the bare root "/" unchanged -- stripping it would produce an empty string, not a valid route', () => {
    expect(normalizeRoute('/')).toBe('/')
  })

  it('only strips one trailing slash, not a run of them', () => {
    expect(normalizeRoute('/docs/foo//')).toBe('/docs/foo/')
  })
})

describe('getPageByRoute: real content, trailing-slash equivalence', () => {
  const realRoute = getFlatPages()[0].route

  it('finds a real page by its exact stored route', () => {
    expect(getPageByRoute(realRoute)?.route).toBe(realRoute)
  })

  it('finds the SAME real page when given the trailing-slash form GitHub Pages redirects a direct/bookmarked URL to', () => {
    expect(getPageByRoute(`${realRoute}/`)?.route).toBe(realRoute)
  })
})
