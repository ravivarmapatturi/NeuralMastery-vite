import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ELI5, GoDeeper } from './ExpandableDepth'
import { renderWithTheme as render } from '../../../tests/unit/renderWithProviders'

describe('ELI5', () => {
  it('defaults open -- content is in the DOM without any interaction', () => {
    render(<ELI5>Plain-English explanation text.</ELI5>)
    expect(screen.getByText('Plain-English explanation text.')).toBeInTheDocument()
  })

  it('shows the "Simple Explanation" label, not the raw "ELI5" jargon', () => {
    render(<ELI5>content</ELI5>)
    expect(screen.getByText('Simple Explanation')).toBeInTheDocument()
    expect(screen.queryByText(/^ELI5$/)).not.toBeInTheDocument()
  })

  it('collapses on click -- content is actually removed from the DOM, not just visually hidden', async () => {
    const user = userEvent.setup()
    render(<ELI5>Plain-English explanation text.</ELI5>)
    await user.click(screen.getByRole('button'))
    // Conditional render ({open && <div>...}), not CSS display:none -- the
    // exact distinction that mattered for the earlier prerender-timing bug
    // this session's memory records (a Suspense-fallback vs. real content
    // question, same "is it actually there or just hidden" category).
    expect(screen.queryByText('Plain-English explanation text.')).not.toBeInTheDocument()
  })

  it('re-expands on a second click', async () => {
    const user = userEvent.setup()
    render(<ELI5>Plain-English explanation text.</ELI5>)
    const button = screen.getByRole('button')
    await user.click(button)
    await user.click(button)
    expect(screen.getByText('Plain-English explanation text.')).toBeInTheDocument()
  })

  it('accepts a custom title, overriding the default label', () => {
    render(<ELI5 title="Custom on-ramp title">content</ELI5>)
    expect(screen.getByText('Custom on-ramp title')).toBeInTheDocument()
    expect(screen.queryByText('Simple Explanation')).not.toBeInTheDocument()
  })

  it('sets aria-expanded to reflect the real open state', async () => {
    const user = userEvent.setup()
    render(<ELI5>content</ELI5>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('GoDeeper', () => {
  it('defaults CLOSED -- content is not in the DOM until opened', () => {
    render(<GoDeeper>Expert-level extra detail.</GoDeeper>)
    expect(screen.queryByText('Expert-level extra detail.')).not.toBeInTheDocument()
  })

  it('shows the "Go deeper" label', () => {
    render(<GoDeeper>content</GoDeeper>)
    expect(screen.getByText('Go deeper')).toBeInTheDocument()
  })

  it('expands on click, revealing real content', async () => {
    const user = userEvent.setup()
    render(<GoDeeper>Expert-level extra detail.</GoDeeper>)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Expert-level extra detail.')).toBeInTheDocument()
  })

  it('aria-expanded starts false and flips true after opening', async () => {
    const user = userEvent.setup()
    render(<GoDeeper>content</GoDeeper>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
