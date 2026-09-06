import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import Home from './Home'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ProgressProvider } from '../contexts/ProgressContext'
import { GamificationProvider } from '../contexts/GamificationContext'
import { getFlatPages } from '../lib/contentTree'
import { SECTION_META, SECTION_ORDER } from '../data/sectionMeta'

const STORAGE_KEY = 'neural-mastery-progress'
const GAMIFICATION_STORAGE_KEY = 'neural-mastery-gamification'

function renderHome() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <ProgressProvider>
            <GamificationProvider>
              <Home />
            </GamificationProvider>
          </ProgressProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Home', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the first-time-visitor hero when nothing is marked understood', () => {
    renderHome()
    expect(screen.getByText('A platform to learn AI structurally, through visualizations.')).toBeInTheDocument()
    expect(screen.getByText('Start Learning →')).toBeInTheDocument()
    expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument()
  })

  it('swaps to a "welcome back" hero with a real continue link once a page is marked understood', () => {
    // A real page from the first (in SECTION_ORDER) group's first subsection,
    // so it's guaranteed to be the group nextUnstartedPage should skip past.
    const firstGroupKey = SECTION_ORDER[0]
    const firstDir = SECTION_META[firstGroupKey].subsections[0].dir
    const firstPageInGroup = getFlatPages().find((p) => p.route.includes(`/docs/${firstDir}/`))!

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [firstPageInGroup.route]: { understood: true, markedAt: Date.now(), stage: 0 } }),
    )

    renderHome()

    expect(screen.getByText(/Welcome back — you've understood 1 page\./)).toBeInTheDocument()
    expect(screen.queryByText('A platform to learn AI structurally, through visualizations.')).not.toBeInTheDocument()

    // The continue CTA should point at some other real page in the same
    // group, not back at the one already marked understood.
    const continueLink = screen.getByText(/^Continue: /)
    expect(continueLink).toBeInTheDocument()
    expect(continueLink.textContent).not.toContain(firstPageInGroup.title)
  })

  it('never recommends a roadmap.mdx checklist page as the "Continue" target', () => {
    // Every subsection follows the same overview.mdx -> roadmap.mdx (right
    // after it) convention across the site -- marking every real page up to
    // (not including) a group's roadmap.mdx understood is the exact
    // real-world setup that would otherwise surface the checklist page next.
    const groupKey = SECTION_ORDER[0]
    const meta = SECTION_META[groupKey]
    const groupPages = getFlatPages().filter((p) => meta.subsections.some((s) => p.route.includes(`/docs/${s.dir}/`)))
    const roadmapIndex = groupPages.findIndex((p) => p.route.endsWith('/roadmap'))
    expect(roadmapIndex).toBeGreaterThan(-1) // sanity: this group really has one

    const understood: Record<string, unknown> = {}
    for (const p of groupPages.slice(0, roadmapIndex)) {
      understood[p.route] = { understood: true, markedAt: Date.now(), stage: 0 }
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(understood))

    renderHome()

    const continueLink = screen.getByText(/^Continue: /).closest('a')!
    expect(continueLink.getAttribute('href')).not.toMatch(/\/roadmap$/)
  })

  it('falls back to the first-time hero when the only marked entry is for a page that no longer exists', () => {
    // Mirrors ProgressPage's own titleFor comment: a stored permalink can
    // stop matching any current page (renamed/removed content) -- that
    // shouldn't read as "you've understood 0 pages".
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ '/docs/some-removed-section/gone-page': { understood: true, markedAt: Date.now(), stage: 0 } }),
    )

    renderHome()

    expect(screen.getByText('A platform to learn AI structurally, through visualizations.')).toBeInTheDocument()
    expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument()
  })

  it('surfaces a due-for-review count and links to the progress page once one exists', () => {
    const oldMarkedAt = Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago -> past the 1-day first interval
    const somePage = getFlatPages()[0]

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [somePage.route]: { understood: true, markedAt: oldMarkedAt, stage: 0 } }),
    )

    renderHome()

    expect(screen.getByText(/1 page is due for review/)).toBeInTheDocument()
    const reviewLink = screen.getByText('Review 1 due page →')
    expect(reviewLink.closest('a')).toHaveAttribute('href', '/progress')
  })

  it('awards a real point for revealing the homepage "Test yourself" flashcard, once, on real first reveal', async () => {
    const user = userEvent.setup()
    renderHome()

    const question = screen.getByText('What is a KV cache, and why does it matter for serving?')
    await user.click(question)
    expect(screen.getByText(/Storing each generated token's Key\/Value projections/)).toBeInTheDocument()

    const stored = JSON.parse(window.localStorage.getItem(GAMIFICATION_STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ permalink: 'flashcard:home-kv-cache', kind: 'flashcard', points: 1 })

    // Real de-duplication check: collapse and re-reveal the SAME card --
    // no second event, no extra point (the underlying award()/hasAward()
    // no-double-award contract, exercised through the real component here).
    await user.click(question)
    await user.click(question)
    const storedAfterReReveal = JSON.parse(window.localStorage.getItem(GAMIFICATION_STORAGE_KEY) ?? '[]')
    expect(storedAfterReReveal).toHaveLength(1)
  })
})
