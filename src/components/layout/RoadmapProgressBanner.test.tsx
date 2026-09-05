import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import RoadmapProgressBanner from './RoadmapProgressBanner'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { ProgressProvider } from '../../contexts/ProgressContext'
import { getSidebar } from '../../lib/contentTree'

const STORAGE_KEY = 'neural-mastery-progress'

// A real, currently-existing section (not a mock) -- same real-content
// testing convention Sidebar.test.tsx and Home.test.tsx already use.
const realSection = getSidebar().find((s) => s.pages.length >= 2)!

function renderBanner(section = realSection.id) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <ProgressProvider>
          <RoadmapProgressBanner section={section} />
        </ProgressProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('RoadmapProgressBanner', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows 0 of N when nothing in this section has been marked understood', () => {
    renderBanner()
    expect(screen.getByText('0', { exact: true })).toBeInTheDocument()
    expect(screen.getByText(String(realSection.pages.length))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(realSection.label))).toBeInTheDocument()
  })

  it('reflects a real page in this section marked understood, not pages from other sections', () => {
    const markedPage = realSection.pages[0].route
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ [markedPage]: { understood: true, markedAt: Date.now(), stage: 0 } }))
    renderBanner()
    expect(screen.getByText('1', { exact: true })).toBeInTheDocument()
  })

  it('does not count a page marked understood in a different section', () => {
    const otherSection = getSidebar().find((s) => s.id !== realSection.id && s.pages.length > 0)!
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [otherSection.pages[0].route]: { understood: true, markedAt: Date.now(), stage: 0 } }),
    )
    renderBanner()
    expect(screen.getByText('0', { exact: true })).toBeInTheDocument()
  })

  it('renders a link to the Progress page', () => {
    renderBanner()
    expect(screen.getByText('View your progress →').closest('a')).toHaveAttribute('href', '/progress')
  })

  it('renders nothing for a section id that does not exist', () => {
    const { container } = renderBanner('not-a-real-section')
    expect(container).toBeEmptyDOMElement()
  })
})
