import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import StreakBadge from './StreakBadge'
import { AuthProvider } from '../../contexts/AuthContext'
import { GamificationProvider } from '../../contexts/GamificationContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function renderBadge() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <GamificationProvider>
          <StreakBadge />
        </GamificationProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('StreakBadge', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 8, 10).getTime()) // 2026-09-10
  })

  it('renders nothing for a genuine 0 streak -- not an empty/zero badge', () => {
    renderBadge()
    expect(screen.queryByTitle(/day streak/i)).not.toBeInTheDocument()
  })

  it('renders the real streak count and links to /profile once there is activity today', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ permalink: '/docs/foo', kind: 'mark', date: '2026-09-10', points: 10 }]),
    )
    renderBadge()
    const link = screen.getByTitle('1 day streak')
    expect(link).toHaveTextContent('1')
    expect(link).toHaveAttribute('href', '/profile')
  })
})
