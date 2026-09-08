import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import PracticeTrackPage from './PracticeTrackPage'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { GamificationProvider } from '../contexts/GamificationContext'
import { ProgressProvider } from '../contexts/ProgressContext'
import { getPracticeProblems } from '../lib/contentTree'
import { getPracticeTracks } from '../lib/practiceTracks'

function renderTrack(topicSlug: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[`/practice/track/${topicSlug}`]}>
        <AuthProvider>
          <ProgressProvider>
            <GamificationProvider>
              <Routes>
                <Route path="/practice/track/:topicSlug" element={<PracticeTrackPage />} />
                <Route path="/practice" element={<div>practice list</div>} />
              </Routes>
            </GamificationProvider>
          </ProgressProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('PracticeTrackPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows only the real problems belonging to the requested track, with the real track label and count', () => {
    const problems = getPracticeProblems()
    const tracks = getPracticeTracks(problems)
    const track = tracks[0]!

    renderTrack(track.slug)

    expect(screen.getByRole('heading', { level: 1, name: track.label })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`\\d+ / ${track.count} solved`))).toBeInTheDocument()

    const trackProblemTitles = problems.filter((p) => p.topic === track.topic).map((p) => p.title.replace(/^Practice:\s*/, ''))
    expect(screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/practice/') && !l.getAttribute('href')?.includes('/track/')).length).toBe(trackProblemTitles.length)
  })

  it('redirects back to /practice for a slug that does not match any real track', () => {
    renderTrack('this-track-does-not-exist')
    expect(screen.getByText('practice list')).toBeInTheDocument()
  })
})
