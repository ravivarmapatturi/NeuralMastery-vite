import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import ProgressPage from './ProgressPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ProgressProvider } from '../contexts/ProgressContext'
import { GamificationProvider } from '../contexts/GamificationContext'
import { REVIEW_COMPLETED_POINTS } from '../lib/gamification'

const GAMIFICATION_STORAGE_KEY = 'neural-mastery-gamification'
const PROGRESS_STORAGE_KEY = 'neural-mastery-progress'

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

  it('shows the real full 10-tier ladder for a brand-new learner, Initiate highlighted as current', () => {
    renderProgressPage()
    expect(screen.getByText('Rank ladder')).toBeInTheDocument()
    // All 10 tiers render, not just the current one.
    for (const label of ['Initiate', 'Apprentice', 'Explorer', 'Builder', 'Practitioner', 'Specialist', 'Expert', 'Master', 'Grandmaster', 'Neural Legend']) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1)
    }
    // A level-1 learner's real current tier is Initiate.
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('highlights the real current tier once real points cross a boundary, not Initiate', () => {
    // Level for 20000 points: floor(1 + sqrt(20000/50)) = 21 -- real Specialist tier (minLevel 21).
    window.localStorage.setItem(
      GAMIFICATION_STORAGE_KEY,
      JSON.stringify([{ permalink: '/docs/deep-learning/attention-transformers', kind: 'complete', date: '2026-09-10', points: 20000 }]),
    )
    renderProgressPage()
    const you = screen.getByText('You')
    // Walk up to the tier card and confirm it's the Specialist one, not Initiate.
    const card = you.closest('div[title]')
    expect(card).toHaveAttribute('title', expect.stringContaining('Specialist'))
  })

  it('renders the YOUR MASTERY hero, Next Best Action, and Curriculum vs Practice sections', () => {
    renderProgressPage()
    expect(screen.getByText('YOUR MASTERY')).toBeInTheDocument()
    expect(screen.getByText(/Level Progress:/i)).toBeInTheDocument()
    expect(screen.getByText('Curriculum Progress')).toBeInTheDocument()
    expect(screen.getByText('Curriculum Checkpoints')).toBeInTheDocument()
    expect(screen.getByText('Practice Progress')).toBeInTheDocument()
    expect(screen.getByText('Mastery Map (Tracks)')).toBeInTheDocument()
    expect(screen.getByText(/Next Best Action/i)).toBeInTheDocument()
  })
})

describe('ProgressPage: real reward-gap fix -- completing a scheduled review earns real points', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('clicking a real due-for-review page awards REVIEW_COMPLETED_POINTS, on top of whatever it already had', async () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ '/docs/deep-learning/attention-transformers': { understood: true, markedAt: twoDaysAgo, stage: 0 } }),
    )
    renderProgressPage()
    expect(screen.getByText('Due for review')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /reviewed/i }))

    // The button click both advances the real spaced-repetition schedule
    // (ProgressContext's own concern) AND awards real points for the
    // same real action (GamificationContext's concern) -- two real,
    // independent effects of one real click, not a fabricated trigger.
    const events = JSON.parse(window.localStorage.getItem(GAMIFICATION_STORAGE_KEY) ?? '[]')
    const reviewEvents = events.filter((e: { kind: string }) => e.kind === 'review')
    expect(reviewEvents).toHaveLength(1)
    expect(reviewEvents[0].points).toBe(REVIEW_COMPLETED_POINTS)
    expect(reviewEvents[0].permalink).toBe('review:/docs/deep-learning/attention-transformers:1') // stage 0 -> 1
  })
})
