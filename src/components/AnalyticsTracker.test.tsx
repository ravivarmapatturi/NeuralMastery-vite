import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import AnalyticsTracker from './AnalyticsTracker'

// Mocks the whole lib/firebase module (not just isSupported()) so these
// tests can assert directly on WHICH event name and params AnalyticsTracker
// calls trackFeatureEvent with per route, rather than the coarser
// "does/doesn't call the real Firebase logEvent" signal already covered
// by trackPageView.test.ts and the real-unsupported-default path.
vi.mock('../lib/firebase', () => ({
  trackPageView: vi.fn().mockResolvedValue(undefined),
  trackFeatureEvent: vi.fn().mockResolvedValue(undefined),
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AnalyticsTracker />
      <Routes>
        <Route path="*" element={<div>page content</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AnalyticsTracker', () => {
  beforeEach(async () => {
    const { trackFeatureEvent, trackPageView } = await import('../lib/firebase')
    vi.mocked(trackFeatureEvent).mockClear()
    vi.mocked(trackPageView).mockClear()
  })

  it('renders nothing (side-effect-only component)', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/foo']}>
        <AnalyticsTracker />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('fires a real learn_page_view event (distinct from the generic page_view) for a real /docs/* route', async () => {
    const { trackFeatureEvent } = await import('../lib/firebase')
    renderAt('/docs/deep-learning/attention-transformers')
    await new Promise((r) => setTimeout(r, 150)) // past the tracker's own 100ms delay
    expect(trackFeatureEvent).toHaveBeenCalledWith('learn_page_view', { page_path: '/docs/deep-learning/attention-transformers' })
  })

  it('fires a real practice_page_view event for a real /practice/* route, not learn_page_view', async () => {
    const { trackFeatureEvent } = await import('../lib/firebase')
    renderAt('/practice/two-sum')
    await new Promise((r) => setTimeout(r, 150))
    expect(trackFeatureEvent).toHaveBeenCalledWith('practice_page_view', { page_path: '/practice/two-sum' })
    expect(trackFeatureEvent).not.toHaveBeenCalledWith('learn_page_view', expect.anything())
  })

  it('fires neither a Learn nor Practice feature event for an unrelated route (e.g. the homepage)', async () => {
    const { trackFeatureEvent } = await import('../lib/firebase')
    renderAt('/')
    await new Promise((r) => setTimeout(r, 150))
    expect(trackFeatureEvent).not.toHaveBeenCalledWith('learn_page_view', expect.anything())
    expect(trackFeatureEvent).not.toHaveBeenCalledWith('practice_page_view', expect.anything())
  })

  it('still fires the generic page_view on every route, alongside the feature-specific one', async () => {
    const { trackPageView } = await import('../lib/firebase')
    renderAt('/docs/foo')
    await new Promise((r) => setTimeout(r, 150))
    expect(trackPageView).toHaveBeenCalled()
  })
})
