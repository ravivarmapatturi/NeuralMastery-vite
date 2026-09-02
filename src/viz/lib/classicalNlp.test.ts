import { describe, expect, it } from 'vitest'
import {
  bestPath,
  lemmatize,
  naiveWhitespaceTokenize,
  ruleBasedTokenize,
  stem,
  TAGS,
  viterbiDecode,
} from './classicalNlp'

describe('naiveWhitespaceTokenize', () => {
  it('splits purely on spaces, punctuation and all', () => {
    expect(naiveWhitespaceTokenize('Dr. Smith runs.')).toEqual(['Dr.', 'Smith', 'runs.'])
  })
})

describe('ruleBasedTokenize', () => {
  it('splits trailing punctuation off a plain word', () => {
    expect(ruleBasedTokenize('runs.')).toEqual(['runs', '.'])
  })

  it('keeps known abbreviations intact instead of splitting the period', () => {
    expect(ruleBasedTokenize('Dr. Smith')).toEqual(['Dr.', 'Smith'])
  })

  it('preserves contractions (no apostrophe splitting)', () => {
    expect(ruleBasedTokenize("don't")).toEqual(["don't"])
  })

  it('leaves a word with no trailing punctuation untouched', () => {
    expect(ruleBasedTokenize('cat')).toEqual(['cat'])
  })
})

describe('stem', () => {
  it('strips a matched suffix via the first applicable rule', () => {
    expect(stem('running')).toBe('runn')
    expect(stem('studies')).toBe('study')
    expect(stem('cats')).toBe('cat')
  })

  it('refuses to strip a suffix that would leave fewer than 3 stem characters', () => {
    // "as" -> stripping "s" would leave "a" (1 char) -- below the 3-char floor.
    expect(stem('as')).toBe('as')
  })

  it('is case-insensitive', () => {
    expect(stem('RUNNING')).toBe(stem('running'))
  })

  it('returns the lowercased word unchanged when no suffix rule matches', () => {
    expect(stem('fish')).toBe('fish')
  })
})

describe('lemmatize', () => {
  it('maps irregular forms to their real lemma via the dictionary', () => {
    expect(lemmatize('ran')).toBe('run')
    expect(lemmatize('running')).toBe('run')
    expect(lemmatize('best')).toBe('good')
    expect(lemmatize('mice')).toBe('mouse')
  })

  it('falls back to the lowercased input for a word not in the dictionary', () => {
    expect(lemmatize('Elephant')).toBe('elephant')
  })
})

describe('viterbiDecode / bestPath (tiny POS-tagging HMM)', () => {
  it("decodes 'the dog runs' to DET NOUN VERB -- hand-verified against TRANSITION/EMISSION", () => {
    // Hand-computed trellis (see test file history / PR description for the full
    // arithmetic): at each step the DET-> path dominates because "the" so strongly
    // favors DET (0.7) and DET->NOUN (0.9) so strongly favors NOUN next, and
    // NOUN->VERB (0.7) combined with VERB's high emission for "runs" (0.4) wins
    // the final column by two orders of magnitude over the DET/NOUN alternatives.
    const trellis = viterbiDecode(['the', 'dog', 'runs'])
    expect(bestPath(trellis)).toEqual(['DET', 'NOUN', 'VERB'])
  })

  it('trellis has one column per word and one cell per tag in each column', () => {
    const words = ['a', 'cat', 'chases']
    const trellis = viterbiDecode(words)
    expect(trellis).toHaveLength(words.length)
    for (const col of trellis) {
      expect(col).toHaveLength(TAGS.length)
      expect(col.map((c) => c.tag).sort()).toEqual([...TAGS].sort())
    }
  })

  it('first column has no backpointers; every later column does', () => {
    const trellis = viterbiDecode(['the', 'dog'])
    for (const cell of trellis[0]) expect(cell.backpointer).toBeNull()
    for (const cell of trellis[1]) expect(cell.backpointer).not.toBeNull()
  })

  it('an unknown word falls back to each tag\'s "other" emission probability without crashing', () => {
    const trellis = viterbiDecode(['the', 'zzzznotaword'])
    expect(trellis).toHaveLength(2)
    for (const cell of trellis[1]) expect(cell.prob).toBeGreaterThan(0)
  })

  it('bestPath always returns exactly one tag per input word', () => {
    const words = ['the', 'cat', 'chases', 'the', 'dog']
    const trellis = viterbiDecode(words)
    expect(bestPath(trellis)).toHaveLength(words.length)
  })
})
