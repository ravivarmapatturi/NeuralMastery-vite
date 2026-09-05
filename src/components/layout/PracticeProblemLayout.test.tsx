import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PracticeProblemLayout from './PracticeProblemLayout'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { AuthProvider } from '../../contexts/AuthContext'
import { ProgressProvider } from '../../contexts/ProgressContext'
import { GamificationProvider } from '../../contexts/GamificationContext'

// Deliberately does NOT render a REAL practice-problem slug here: doing so
// mounts its React.lazy-wrapped MDX component, and this project's vitest
// config (see vitest.config.ts's own comment) never runs .mdx files
// through the real MDX/Vite transform in unit tests -- only DocLayout's
// sibling, this component's real content rendering is verified the same
// way every other MDX page's is, via a real Playwright check against the
// actual built dist/ (part of the standing ship checklist), not here. What
// IS real and testable at this layer without touching MDX: the not-found
// fallback, which returns before ever mounting a lazy component -- the
// same reason DocLayout itself has no direct unit test either.
function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <ProgressProvider>
            <GamificationProvider>
              <PracticeProblemLayout />
            </GamificationProvider>
          </ProgressProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('PracticeProblemLayout', () => {
  it('shows a real not-found state for a slug with no matching problem, instead of throwing or rendering a blank page', () => {
    renderAt('/practice/not-a-real-problem')
    expect(screen.getByRole('heading', { name: /Page not found/i })).toBeInTheDocument()
  })
})
