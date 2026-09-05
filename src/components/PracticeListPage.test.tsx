import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import PracticeListPage from './PracticeListPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function renderList() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <PracticeListPage />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('PracticeListPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('lists real practice problems with a real link to their /practice/<slug> detail page', () => {
    renderList()
    const link = screen.getByRole('link', { name: /Dot Product From Scratch/i })
    expect(link).toHaveAttribute('href', '/practice/dot-product')
  })

  it('shows the real solved count in the header, starting at 0 for a fresh visitor', () => {
    renderList()
    expect(screen.getByText(/^0 \/ \d+ solved$/)).toBeInTheDocument()
  })

  it('reflects a real completed problem as Solved, and increments the header count', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ permalink: '/practice/dot-product', kind: 'complete', date: '2026-09-10', points: 50 }]),
    )
    renderList()
    expect(screen.getByText(/^1 \/ \d+ solved$/)).toBeInTheDocument()
    const row = screen.getByRole('link', { name: /Dot Product From Scratch/i })
    expect(row).toHaveTextContent('✓ Solved')
  })

  it('tags a system-design challenge as "Design" instead of an Easy/Medium/Hard label', () => {
    renderList()
    const row = screen.getByRole('link', { name: /A RAG System Over 100M Enterprise Documents/i })
    expect(row).toHaveTextContent('Design')
    expect(row).toHaveTextContent('100 pts') // SYSTEM_DESIGN_CHALLENGE_POINTS, not the flat 50
  })

  it('the search box filters the list by real title text', async () => {
    renderList()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/search practice problems/i), 'batch dot product')
    expect(screen.getByRole('link', { name: /Batch Dot Product/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Dot Product From Scratch/i })).not.toBeInTheDocument()
  })

  it('the difficulty filter narrows to real Hard-only problems', async () => {
    renderList()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/filter by difficulty/i), 'hard')
    // A real Easy problem should now be filtered out.
    expect(screen.queryByRole('link', { name: /^Dot Product From Scratch/i })).not.toBeInTheDocument()
  })
})
