import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RankBadge from './RankBadge'
import { RANK_TIERS } from '../lib/rankTiers'

describe('RankBadge component', () => {
  it('renders every one of the 10 tiers with valid SVG without crashing', () => {
    for (const tier of RANK_TIERS) {
      const { unmount, container } = render(<RankBadge tier={tier} size={36} showLabel />)
      expect(screen.getByText(tier.label)).toBeInTheDocument()
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '36')
      expect(svg).toHaveAttribute('height', '36')
      unmount()
    }
  })

  it('renders top tiers (Expert, Master, Grandmaster, Neural Legend) with active animation classes', () => {
    const legendTier = RANK_TIERS.find((t) => t.id === 'neurallegend')!
    const { container: legendContainer } = render(<RankBadge tier={legendTier} size={48} />)
    expect(legendContainer.querySelector('.nm-rank-badge-legend')).toBeInTheDocument()
    expect(legendContainer.querySelector('.nm-rank-shimmer-rect')).toBeInTheDocument()

    const expertTier = RANK_TIERS.find((t) => t.id === 'expert')!
    const { container: expertContainer } = render(<RankBadge tier={expertTier} size={48} />)
    expect(expertContainer.querySelector('.nm-rank-badge-top')).toBeInTheDocument()
    expect(expertContainer.querySelector('.nm-rank-shimmer-rect')).toBeInTheDocument()
  })

  it('renders lower tiers (Initiate, Apprentice, Explorer) without top-tier animation classes', () => {
    const initiateTier = RANK_TIERS.find((t) => t.id === 'initiate')!
    const { container } = render(<RankBadge tier={initiateTier} size={28} />)
    expect(container.querySelector('.nm-rank-badge-top')).toBeNull()
    expect(container.querySelector('.nm-rank-badge-legend')).toBeNull()
    expect(container.querySelector('.nm-rank-shimmer-rect')).toBeNull()
  })

  it('includes prefers-reduced-motion rules in style tag', () => {
    const legendTier = RANK_TIERS.find((t) => t.id === 'neurallegend')!
    const { container } = render(<RankBadge tier={legendTier} size={48} />)
    const styleEl = container.querySelector('style')
    expect(styleEl?.textContent).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styleEl?.textContent).toContain('animation: none !important')
  })
})
