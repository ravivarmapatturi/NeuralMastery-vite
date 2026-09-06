import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
  it('shows the real current year and links to About/Privacy/Terms', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 6))
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )
    expect(screen.getByText('© 2026 Neural Mastery')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
