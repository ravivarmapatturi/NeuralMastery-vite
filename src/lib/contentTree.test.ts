import { describe, expect, it } from 'vitest'
import { getSidebar, getPageByRoute, getPracticeProblems, getFlatPages } from './contentTree'

describe('contentTree: practice-problems -> /practice IA split', () => {
  it('a real practice-problem page resolves by its NEW /practice/<slug> route', () => {
    const page = getPageByRoute('/practice/dot-product')
    expect(page).toBeDefined()
    expect(page!.route).toBe('/practice/dot-product')
    expect(page!.section).toBe('practice-problems')
  })

  it('the OLD /docs/practice-problems/<slug> route no longer resolves to anything -- the URL moved, not the content', () => {
    expect(getPageByRoute('/docs/practice-problems/dot-product')).toBeUndefined()
  })

  it('overview.mdx is gone entirely -- neither its old nor a hypothetical new route resolves', () => {
    expect(getPageByRoute('/docs/practice-problems/overview')).toBeUndefined()
    expect(getPageByRoute('/practice/overview')).toBeUndefined()
  })

  it('getSidebar() excludes practice-problems -- it is a top-level destination now, not a docs sidebar section', () => {
    const ids = getSidebar().map((s) => s.id)
    expect(ids).not.toContain('practice-problems')
  })

  it('getFlatPages() (derived from getSidebar()) also excludes practice-problems, so PrevNext/ProgressPage never see them', () => {
    const routes = getFlatPages().map((p) => p.route)
    expect(routes.some((r) => r.startsWith('/practice/'))).toBe(false)
  })

  it('getPracticeProblems() returns every real practice problem, independent of the docs sidebar', () => {
    const problems = getPracticeProblems()
    expect(problems.length).toBeGreaterThan(40) // real count is 53; a loose floor so unrelated content edits don't break this
    expect(problems.every((p) => p.route.startsWith('/practice/'))).toBe(true)
    expect(problems.some((p) => p.route === '/practice/overview')).toBe(false)
  })

  it('every real practice problem carries a topic, and all but the 4 design challenges carry a difficulty', () => {
    const problems = getPracticeProblems()
    const withTopic = problems.filter((p) => p.topic)
    const withDifficulty = problems.filter((p) => p.difficulty)
    expect(withTopic.length).toBe(problems.length)
    expect(problems.length - withDifficulty.length).toBe(4)
  })
})
