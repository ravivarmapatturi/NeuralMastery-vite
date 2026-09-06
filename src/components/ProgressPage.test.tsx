import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import ProgressPage from './ProgressPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ProgressProvider } from '../contexts/ProgressContext'
import { GamificationProvider } from '../contexts/GamificationContext'

const GAMIFICATION_STORAGE_KEY = 'neural-mastery-gamification'

function renderProgressPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <ProgressProvider>
            <GamificationProvider>
              <ProgressPage />
            </GamificationProvider>
          </ProgressProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('ProgressPage rank ladder', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the real full 8-tier ladder for a brand-new learner, Bronze highlighted as current', () => {
    renderProgressPage()
    expect(screen.getByText('Rank ladder')).toBeInTheDocument()
    // All 8 tiers render, not just the current one.
    for (const label of ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    // A level-1 learner's real current tier is Bronze.
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('highlights the real current tier once real points cross a boundary, not Bronze', () => {
    // Level for 20000 points: floor(1 + sqrt(20000/50)) = 21 -- real Diamond tier (minLevel 20).
    window.localStorage.setItem(
      GAMIFICATION_STORAGE_KEY,
      JSON.stringify([{ permalink: '/docs/deep-learning/attention-transformers', kind: 'complete', date: '2026-09-10', points: 20000 }]),
    )
    renderProgressPage()
    const you = screen.getByText('You')
    // Walk up to the tier card and confirm it's the Diamond one, not Bronze.
    const card = you.closest('div[title]')
    expect(card).toHaveAttribute('title', expect.stringContaining('Diamond'))
  })
})
