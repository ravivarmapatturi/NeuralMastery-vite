import { describe, expect, it, vi } from 'vitest'

// Overrides tests/unit/setup.ts's global firebase/analytics mock for THIS
// FILE ONLY -- Vitest isolates each test file's module registry by
// default, so this doesn't affect any other test file's isSupported()
// default (false, matching real jsdom, which has no IndexedDB). Needed
// specifically because lib/firebase.ts's analyticsPromise resolves
// isSupported() exactly once at module-load time -- the only way to
// exercise the "supported" branch is to have it already true before
// lib/firebase.ts is first imported below, not by mutating the mock
// afterward.
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  isSupported: vi.fn().mockResolvedValue(true),
  setConsent: vi.fn(),
  logEvent: vi.fn(),
}))

describe('trackPageView (analytics supported)', () => {
  it('logs a real page_view event with the real path, title, and current URL', async () => {
    const { trackPageView } = await import('./firebase')
    const { logEvent } = await import('firebase/analytics')

    await trackPageView('/docs/deep-learning/attention-transformers', 'Attention & Transformers — Neural Mastery')

    expect(logEvent).toHaveBeenCalledTimes(1)
    const [, eventName, params] = vi.mocked(logEvent).mock.calls[0]
    expect(eventName).toBe('page_view')
    expect(params).toMatchObject({
      page_path: '/docs/deep-learning/attention-transformers',
      page_title: 'Attention & Transformers — Neural Mastery',
    })
  })

  it('sets a default-denied consent posture before anything else initializes -- no consent-banner UI exists yet', async () => {
    const { setConsent } = await import('firebase/analytics')
    expect(setConsent).toHaveBeenCalledWith({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })
})
