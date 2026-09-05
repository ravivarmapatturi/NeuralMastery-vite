import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { logEvent } from 'firebase/analytics'
import AnalyticsTracker from './AnalyticsTracker'

// analyticsPromise in lib/firebase.ts resolves isSupported() exactly once,
// at module-load time -- this file relies on tests/unit/setup.ts's global
// default (isSupported() -> false, the real answer in jsdom, which has no
// IndexedDB), so trackPageView is a real no-op here throughout. The
// "supported, logs a real event" path is covered separately in
// src/lib/trackPageView.test.ts, which mocks isSupported() to true from
// that file's own first import -- each test FILE gets its own isolated
// module registry in Vitest, so the two files don't fight over one
// process-wide analyticsPromise value.

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
  it('renders nothing (side-effect-only component)', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs/foo']}>
        <AnalyticsTracker />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('does not log an event when analytics is unsupported (the real jsdom-test default)', async () => {
    renderAt('/docs/foo')
    await new Promise((r) => setTimeout(r, 150)) // past the tracker's own 100ms delay
    expect(logEvent).not.toHaveBeenCalled()
  })
})
