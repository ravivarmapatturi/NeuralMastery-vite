import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import TermsOfServicePage from './TermsOfServicePage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'

function renderTerms() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <TermsOfServicePage />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('TermsOfServicePage', () => {
  it('states the basic, honest terms for a free, solo-maintained site', () => {
    renderTerms()
    expect(screen.getByRole('heading', { name: /Terms of Service/i })).toBeInTheDocument()
    expect(screen.getByText(/free educational site/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /No warranty/i })).toBeInTheDocument()
  })
})
