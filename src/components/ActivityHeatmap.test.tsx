import { render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import ActivityHeatmap from './ActivityHeatmap'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { AwardEvent } from '../lib/gamification'

function renderHeatmap(events: AwardEvent[]) {
  return render(
    <ThemeProvider>
      <ActivityHeatmap events={events} />
    </ThemeProvider>,
  )
}

describe('ActivityHeatmap', () => {
  beforeEach(() => {
    // Explicit Date.now() mock -- the component itself now threads
    // Date.now() through (not a bare `new Date()`), so this actually takes
    // effect; see the gotcha documented in gamification.ts.
    vi.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 8, 10).getTime()) // 2026-09-10
  })

  it('shows 0 active days for no activity, not a crash or a false count', () => {
    renderHeatmap([])
    expect(screen.getByText(/0 active days in the last 12 weeks/i)).toBeInTheDocument()
  })

  it('counts the real number of distinct active dates from the event log, not the number of events', () => {
    const events: AwardEvent[] = [
      { permalink: '/a', kind: 'mark', date: '2026-09-08', points: 10 },
      { permalink: '/b', kind: 'mark', date: '2026-09-08', points: 10 }, // same day as above -- 1 active day, not 2
      { permalink: '/c', kind: 'complete', date: '2026-09-09', points: 50 },
    ]
    renderHeatmap(events)
    expect(screen.getByText(/2 active days in the last 12 weeks/i)).toBeInTheDocument()
  })

  it('exposes a real per-day tooltip with the actual award count for that date', () => {
    const events: AwardEvent[] = [{ permalink: '/a', kind: 'mark', date: '2026-09-08', points: 10 }]
    renderHeatmap(events)
    expect(screen.getByTitle('2026-09-08: 1 award')).toBeInTheDocument()
  })
})
