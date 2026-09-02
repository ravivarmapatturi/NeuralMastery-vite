import { describe, expect, it } from 'vitest'
import { headingPlainText, slugify } from './anchorSlug.mjs'

describe('slugify', () => {
  it('lowercases and hyphenates plain text', () => {
    expect(slugify('Basic Architecture')).toBe('basic-architecture')
  })

  it('collapses any run of whitespace into a SINGLE hyphen -- never double', () => {
    // Regression case: an em-dash heading like "BERT, RoBERTa — encoder-only
    // representations" strips the em-dash (not \w, \s, or '-') leaving a
    // double space, which \s+ -> '-' collapses to ONE hyphen, not two. Two
    // real anchor links this session were hand-written assuming a double
    // hyphen here and both broke check:links -- this locks the real
    // behavior down so it can't silently regress again.
    expect(slugify('bert, roberta, deberta, and sbert — encoder-only representations')).toBe(
      'bert-roberta-deberta-and-sbert-encoder-only-representations',
    )
    expect(slugify('bert, roberta, deberta, and sbert — encoder-only representations')).not.toContain('--')
  })

  it('deletes a slash entirely rather than turning it into a hyphen', () => {
    // Regression case: "The Request/Response Cycle" -- '/' is not \w, \s,
    // or '-', so it's just deleted, merging the two words together. A
    // hand-written anchor assuming '/' becomes '-' (the-request-response-
    // cycle) is wrong; the real id merges them (the-requestresponse-cycle).
    expect(slugify('the request/response cycle')).toBe('the-requestresponse-cycle')
  })

  it('strips punctuation but keeps existing hyphens and word characters', () => {
    expect(slugify('REST vs. GraphQL vs. gRPC')).toBe('rest-vs-graphql-vs-grpc')
    expect(slugify('Encoder-only: the BERT lineage')).toBe('encoder-only-the-bert-lineage')
  })

  it('trims leading/trailing whitespace before slugifying', () => {
    expect(slugify('  Padded Heading  ')).toBe('padded-heading')
  })

  it('is idempotent on an already-slugified string', () => {
    const once = slugify('Some Heading Text')
    expect(slugify(once)).toBe(once)
  })
})

describe('headingPlainText', () => {
  it('strips markdown links down to their visible text', () => {
    const { text } = headingPlainText('See [the docs](https://example.com/path) for more')
    expect(text).toBe('See the docs for more')
  })

  it('strips inline code backticks', () => {
    const { text } = headingPlainText('Using `RecursiveCharacterTextSplitter` in Practice')
    expect(text).toBe('Using RecursiveCharacterTextSplitter in Practice')
  })

  it('strips bold and italic emphasis', () => {
    expect(headingPlainText('**Bold** and *italic* text').text).toBe('Bold and italic text')
  })

  it('strips underscore-italic without touching identifiers containing underscores', () => {
    // _italic_ should unwrap, but a word like snake_case_name must survive --
    // the lookaround guards are exactly what makes that distinction.
    expect(headingPlainText('_italic_ word').text).toBe('italic word')
    expect(headingPlainText('a snake_case_name here').text).toBe('a snake_case_name here')
  })

  it('flags inline math and strips the $ delimiters from the reconstructed text', () => {
    const { text, hasInlineMath } = headingPlainText('Attention() vs. head$_i$: the Same Function')
    expect(hasInlineMath).toBe(true)
    expect(text).toBe('Attention() vs. head_i: the Same Function')
  })

  it('does not flag inline math when there is none', () => {
    expect(headingPlainText('A plain heading with no math').hasInlineMath).toBe(false)
  })

  it('composes with slugify to reproduce a real sitewide heading id', () => {
    const { text } = headingPlainText('**BERT**, RoBERTa, DeBERTa, and SBERT — encoder-only representations')
    expect(slugify(text)).toBe('bert-roberta-deberta-and-sbert-encoder-only-representations')
  })
})
