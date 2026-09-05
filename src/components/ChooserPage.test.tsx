import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ChooserPage from './ChooserPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'
import { ProgressProvider } from '../contexts/ProgressContext'

function renderChooser() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <ProgressProvider>
            <GamificationProvider>
              <ChooserPage />
            </GamificationProvider>
          </ProgressProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('ChooserPage', () => {
  it('introduces the product with its learning loop and routes to both real destinations', () => {
    renderChooser()
    expect(screen.getByRole('heading', { name: /See it/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /One concept. A complete learning loop/i })).toBeInTheDocument()
    const learnLink = screen.getByRole('link', { name: /Explore the curriculum/i })
    const practiceLink = screen.getByRole('link', { name: /Try a coding problem/i })
    expect(learnLink).toHaveAttribute('href', '/learn')
    expect(practiceLink).toHaveAttribute('href', '/practice')
  })

  it('uses verified page and problem counts as product proof', () => {
    renderChooser()
    expect(screen.getByText((_, el) => /^\d+\+learning pages$/i.test(el?.textContent ?? ''))).toBeInTheDocument()
    expect(screen.getByText((_, el) => /^\d+\+coding problems$/i.test(el?.textContent ?? ''))).toBeInTheDocument()
  })

  it('surfaces the actual curriculum domains rather than invented feature claims', () => {
    renderChooser()
    expect(screen.getByRole('link', { name: /Foundations/i })).toHaveAttribute('href', '/docs/category/foundations')
    expect(screen.getByRole('link', { name: /Systems & Infrastructure/i })).toHaveAttribute('href', '/docs/category/systems--infrastructure')
  })
})
