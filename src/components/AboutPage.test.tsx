import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AboutPage from './AboutPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'

function renderAbout() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <AboutPage />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('AboutPage', () => {
  it('describes the real product and links to GitHub as the real contact channel, not a fabricated one', () => {
    renderAbout()
    expect(screen.getByRole('heading', { name: /About Neural Mastery/i })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Open an issue on GitHub/i })
    expect(link).toHaveAttribute('href', 'https://github.com/ravivarmapatturi/NeuralMastery-vite/issues')
  })
})
