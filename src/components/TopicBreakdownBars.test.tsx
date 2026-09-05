import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TopicBreakdownBars from './TopicBreakdownBars'
import type { AwardEvent } from '../lib/gamification'

describe('TopicBreakdownBars', () => {
  it('shows an honest empty state, not zeroed bars, when nothing has been earned yet', () => {
    render(<TopicBreakdownBars events={[]} />)
    expect(screen.getByText(/No points earned yet/i)).toBeInTheDocument()
  })

  it('renders a real bar per group with points and percentage, sorted by points descending', () => {
    const events: AwardEvent[] = [
      { permalink: '/docs/mlops/observability', kind: 'complete', date: '2026-01-01', points: 50 },
      { permalink: '/docs/deep-learning/attention-transformers', kind: 'mark', date: '2026-01-01', points: 10 },
    ]
    render(<TopicBreakdownBars events={events} />)

    const rows = screen.getAllByText(/pts? ·/i)
    expect(rows).toHaveLength(2)
    // Systems & Infrastructure (50 pts) must appear before Models (10 pts) -- sorted descending.
    expect(rows[0]).toHaveTextContent('50 pts · 83%')
    expect(rows[1]).toHaveTextContent('10 pts · 17%')
  })
})
