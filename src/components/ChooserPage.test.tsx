import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ChooserPage from './ChooserPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'

function renderChooser() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <ChooserPage />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('ChooserPage', () => {
  it('renders two real, equally-weighted destinations -- Learn AI and Practice AI', () => {
    renderChooser()
    const learnLink = screen.getByRole('link', { name: /Learn AI/i })
    const practiceLink = screen.getByRole('link', { name: /Practice AI/i })
    expect(learnLink).toHaveAttribute('href', '/learn')
    expect(practiceLink).toHaveAttribute('href', '/practice')
  })

  it('shows a real problem count on the Practice card, not a placeholder', () => {
    renderChooser()
    expect(screen.getByText(/\d+\+ real coding problems/i)).toBeInTheDocument()
  })

  it('marks Practice as NEW (both on the card here and on the persistent Navbar link)', () => {
    renderChooser()
    expect(screen.getAllByText('NEW').length).toBeGreaterThanOrEqual(1)
  })
})
