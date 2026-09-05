import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import ProfilePage from './ProfilePage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function renderProfile() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <ProfilePage />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 8, 10).getTime())
  })

  it('renders a real identity, level 1, and 0 points/streak for a brand-new signed-out visitor', () => {
    renderProfile()
    expect(screen.getByRole('heading', { name: /Learner_000000/i })).toBeInTheDocument()
    expect(screen.getByText(/^Level 1$/)).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // points stat
    expect(screen.getByText(/sign in to sync/i)).toBeInTheDocument()
    // Real user report this guards against: a signed-in visitor sees a bare
    // "0 days" with no explanation and assumes it's a bug. A visitor who has
    // genuinely never earned an award gets the "start your streak" message,
    // not the "reset" one -- those are different real situations.
    expect(screen.getByText(/mark a page understood or solve a practice problem to start your streak/i)).toBeInTheDocument()
  })

  it('shows a "streak reset" message, not "start your streak", when past activity exists but the streak already broke', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      // "now" is mocked to 2026-09-10; this award is 5 days stale, well past
      // the "still alive until midnight" 1-day grace computeStreak allows.
      JSON.stringify([{ permalink: '/docs/deep-learning/attention-transformers', kind: 'mark', date: '2026-09-05', points: 10 }]),
    )
    renderProfile()
    expect(screen.getByText(/^0 days$/)).toBeInTheDocument()
    expect(screen.getByText(/streak reset — do that again today to start a new one/i)).toBeInTheDocument()
    expect(screen.queryByText(/mark a page understood or solve a practice problem to start your streak/i)).not.toBeInTheDocument()
  })

  it('reflects real earned points as level/XP progress and a topic breakdown, not zeros', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ permalink: '/docs/deep-learning/attention-transformers', kind: 'complete', date: '2026-09-10', points: 50 }]),
    )
    renderProfile()
    expect(screen.getByText(/^Level 2$/)).toBeInTheDocument() // 50 points crosses the level-2 threshold
    expect(screen.getByText('50')).toBeInTheDocument() // points stat
    expect(screen.getByText(/50 pts · 100%/)).toBeInTheDocument() // sole topic group gets 100% of the pie
  })

  it('cross-links to /progress instead of duplicating the page-by-page checklist', () => {
    renderProfile()
    const link = screen.getByRole('link', { name: /your Progress page/i })
    expect(link).toHaveAttribute('href', '/progress')
  })
})
