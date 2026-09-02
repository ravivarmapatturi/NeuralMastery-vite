import { useRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TableOfContents from './TableOfContents'
import { slugify } from '../../../scripts/lib/anchorSlug.mjs'

function Harness({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <>
      <div ref={ref}>{children}</div>
      <TableOfContents contentRef={ref} />
    </>
  )
}

describe('TableOfContents', () => {
  it('renders nothing when the content has no h2/h3 headings', async () => {
    render(
      <Harness>
        <p>Just a paragraph, no headings.</p>
      </Harness>,
    )
    // "On this page" only appears once a heading is found -- give the
    // MutationObserver/effect a tick, then assert it's still absent.
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText('On this page')).not.toBeInTheDocument()
  })

  it('lists every h2/h3 as a link, in document order', async () => {
    render(
      <Harness>
        <h2>Introduction</h2>
        <p>Some text.</p>
        <h3>A Subsection</h3>
        <h2>Conclusion</h2>
      </Harness>,
    )
    await waitFor(() => expect(screen.getByText('On this page')).toBeInTheDocument())
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Introduction', 'A Subsection', 'Conclusion'])
  })

  it("assigns each heading's real runtime slug id, matching check-anchor-links.mjs's slugify() exactly -- the invariant that class of link-checker script depends on", async () => {
    // These are the exact headings this session hand-derived (and initially
    // got wrong) anchors for: an em-dash heading and a slash-containing one.
    render(
      <Harness>
        <h3>BERT, RoBERTa, DeBERTa, and SBERT — encoder-only representations</h3>
        <h2>The Request/Response Cycle</h2>
      </Harness>,
    )
    await waitFor(() => expect(screen.getByText('On this page')).toBeInTheDocument())

    const emDashLink = screen.getByRole('link', { name: 'BERT, RoBERTa, DeBERTa, and SBERT — encoder-only representations' })
    const slashLink = screen.getByRole('link', { name: 'The Request/Response Cycle' })

    // TableOfContents.tsx's scanHeadings() slugifies via textContent (no
    // markdown to strip, since this is already-rendered DOM) -- for these
    // two plain-text headings that's directly comparable to anchorSlug.mjs's
    // slugify() applied to the same raw text.
    expect(emDashLink.getAttribute('href')).toBe(`#${slugify('BERT, RoBERTa, DeBERTa, and SBERT — encoder-only representations')}`)
    expect(slashLink.getAttribute('href')).toBe(`#${slugify('The Request/Response Cycle')}`)

    // And the concrete real values, so a future accidental change to either
    // algorithm's regex fails here even if the other test's indirection
    // somehow didn't catch it.
    expect(emDashLink.getAttribute('href')).toBe('#bert-roberta-deberta-and-sbert-encoder-only-representations')
    expect(slashLink.getAttribute('href')).toBe('#the-requestresponse-cycle')
  })

  it('does not overwrite a heading that already has a real id (e.g. one KaTeX or a plugin assigned)', async () => {
    render(
      <Harness>
        <h2 id="custom-id-already-set">Some Heading</h2>
      </Harness>,
    )
    await waitFor(() => expect(screen.getByText('On this page')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Some Heading' }).getAttribute('href')).toBe('#custom-id-already-set')
  })

  it('indents h3 links relative to h2 links (nested contents visually reflect heading level)', async () => {
    render(
      <Harness>
        <h2>Top Level</h2>
        <h3>Nested</h3>
      </Harness>,
    )
    await waitFor(() => expect(screen.getByText('On this page')).toBeInTheDocument())
    const topLevel = screen.getByRole('link', { name: 'Top Level' })
    const nested = screen.getByRole('link', { name: 'Nested' })
    expect(nested.style.paddingLeft).not.toBe(topLevel.style.paddingLeft)
  })
})
