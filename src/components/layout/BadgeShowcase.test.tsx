import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import BadgeShowcase from './BadgeShowcase'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { AuthProvider } from '../../contexts/AuthContext'
import { GamificationProvider } from '../../contexts/GamificationContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function renderShowcase() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <BadgeShowcase />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('BadgeShowcase', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders only the empty state when no badges are unlocked, without placeholder locked tiles', () => {
    renderShowcase()
    expect(screen.getByText(/Unlocked 0 of \d+ checkpoint badges/)).toBeInTheDocument()
    expect(screen.getByText(/No checkpoint badges earned yet/i)).toBeInTheDocument()
    expect(screen.queryByText('LOCKED')).not.toBeInTheDocument()
    expect(screen.queryByText('UNLOCKED')).not.toBeInTheDocument()
  })

  it('renders ONLY the unlocked badges when achievements exist, removing locked-badge placeholder tiles entirely', () => {
    // Earn 50 XP -> unlocks the "First Step" badge
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ permalink: '/practice/dot-product', kind: 'complete', date: '2026-09-10', points: 50 }]),
    )
    renderShowcase()

    expect(screen.getByText(/Unlocked 1 of \d+ checkpoint badges/)).toBeInTheDocument()
    expect(screen.getByText('First Step')).toBeInTheDocument()
    expect(screen.getByText('UNLOCKED')).toBeInTheDocument()

    // Absolutely no LOCKED tiles/badges rendered in the DOM
    expect(screen.queryByText('LOCKED')).not.toBeInTheDocument()
    // "Code Ninja" (needs 5 problems) should NOT be rendered
    expect(screen.queryByText('Code Ninja')).not.toBeInTheDocument()
    // "Attention Architect" (needs 500 XP) should NOT be rendered
    expect(screen.queryByText('Attention Architect')).not.toBeInTheDocument()
  })
})
