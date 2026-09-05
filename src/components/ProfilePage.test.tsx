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
