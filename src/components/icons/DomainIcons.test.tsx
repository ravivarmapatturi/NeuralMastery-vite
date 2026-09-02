import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DomainIcon, DOMAIN_ICON_BY_GROUP_KEY } from './DomainIcons'
import { SECTION_ORDER } from '../../data/sectionMeta'

describe('DomainIcon', () => {
  it('renders a real domain-specific icon for every SECTION_ORDER key', () => {
    for (const key of SECTION_ORDER) {
      const { container, unmount } = render(<DomainIcon groupKey={key} color="#123456" size={20} />)
      const svg = container.querySelector('svg')
      expect(svg, `expected an <svg> for group key ${key}`).toBeTruthy()
      // A real mapped icon draws more than the fallback's single <circle> --
      // multiple paths/rects/lines/circles, not just one shape.
      expect(svg!.querySelectorAll('*').length).toBeGreaterThan(1)
      unmount()
    }
  })

  it('falls back to a plain single dot -- not a crash, not nothing -- for an unmapped group key', () => {
    const { container } = render(<DomainIcon groupKey="/docs/category/not-a-real-group" color="#123456" size={20} />)
    const svg = container.querySelector('svg')!
    expect(svg).toBeTruthy()
    expect(svg.querySelectorAll('*').length).toBe(1)
    expect(svg.querySelector('circle')).toBeTruthy()
  })

  it('every SECTION_ORDER key has an actual entry in DOMAIN_ICON_BY_GROUP_KEY, not silently relying on the fallback', () => {
    for (const key of SECTION_ORDER) {
      expect(DOMAIN_ICON_BY_GROUP_KEY[key], `missing icon mapping for ${key}`).toBeDefined()
    }
  })

  it('passes the color prop through to the rendered icon', () => {
    const { container } = render(<DomainIcon groupKey={SECTION_ORDER[0]} color="#ff0000" size={20} />)
    expect(container.querySelector('svg')!.innerHTML).toContain('#ff0000')
  })

  it('passes the color prop through to the fallback icon too', () => {
    const { container } = render(<DomainIcon groupKey="/docs/category/not-a-real-group" color="#00ff00" size={20} />)
    expect(container.querySelector('circle')!.getAttribute('fill')).toBe('#00ff00')
  })
})
