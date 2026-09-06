import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'
import { GamificationProvider, useGamification } from './GamificationContext'
import { AuthProvider } from './AuthContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function Harness() {
  const { points, weeklyPoints, streak, awardMarkUnderstood, awardProblemCompleted, awardSystemDesignCompleted, awardFlashcardRevealed } = useGamification()
  return (
    <div>
      <div data-testid="points">{points}</div>
      <div data-testid="weekly">{weeklyPoints}</div>
      <div data-testid="streak">{streak}</div>
      <button onClick={() => awardMarkUnderstood('/docs/foo')}>mark-foo</button>
      <button onClick={() => awardMarkUnderstood('/docs/bar')}>mark-bar</button>
      <button onClick={() => awardProblemCompleted('/docs/problem-1', 'medium')}>complete-problem-1</button>
      <button onClick={() => awardProblemCompleted('/practice/easy-one', 'easy')}>complete-easy</button>
      <button onClick={() => awardProblemCompleted('/practice/hard-one', 'hard')}>complete-hard</button>
      <button onClick={() => awardProblemCompleted('/practice/no-difficulty', undefined)}>complete-no-difficulty</button>
      <button onClick={() => awardSystemDesignCompleted('/docs/practice-problems/design-challenge-rag-system')}>complete-design-challenge</button>
      <button onClick={() => awardFlashcardRevealed('flashcard:home-kv-cache')}>reveal-flashcard</button>
      <button onClick={() => awardFlashcardRevealed('flashcard:other-card')}>reveal-other-flashcard</button>
    </div>
  )
}

function setup() {
  return render(
    <AuthProvider>
      <GamificationProvider>
        <Harness />
      </GamificationProvider>
    </AuthProvider>,
  )
}

let now = new Date(2026, 8, 10).getTime() // Thursday, 2026-09-10

beforeEach(() => {
  window.localStorage.clear()
  now = new Date(2026, 8, 10).getTime()
  vi.spyOn(Date, 'now').mockImplementation(() => now)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
    ;(callback as (u: null) => void)(null)
    return () => {}
  })
  vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => undefined } as unknown as Awaited<ReturnType<typeof getDoc>>)
  vi.mocked(setDoc).mockResolvedValue(undefined)
})

function advanceDays(days: number) {
  now += days * 24 * 60 * 60 * 1000
}

describe('GamificationContext: signed-out (localStorage only)', () => {
  it('starts at 0 points and 0 streak with no activity', () => {
    setup()
    expect(screen.getByTestId('points')).toHaveTextContent('0')
    expect(screen.getByTestId('streak')).toHaveTextContent('0')
  })

  it('awards points for marking a page understood and persists to localStorage', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('mark-foo'))
    expect(screen.getByTestId('points')).toHaveTextContent('10')
    expect(screen.getByTestId('streak')).toHaveTextContent('1')

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ permalink: '/docs/foo', kind: 'mark', points: 10 })
  })

  it('awards bigger points for completing a practice problem', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('complete-problem-1'))
    expect(screen.getByTestId('points')).toHaveTextContent('50')
  })

  it('scales the award by real difficulty -- easy < medium < hard, not one flat value', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('complete-easy'))
    expect(screen.getByTestId('points')).toHaveTextContent('25')
    await user.click(screen.getByText('complete-hard'))
    expect(screen.getByTestId('points')).toHaveTextContent(String(25 + 100))
  })

  it('falls back to the default (medium-equivalent) value when a problem has no difficulty frontmatter', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('complete-no-difficulty'))
    expect(screen.getByTestId('points')).toHaveTextContent('50')
  })

  it('awards a small point value for the first flashcard reveal, and never re-awards the SAME card again', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('reveal-flashcard'))
    expect(screen.getByTestId('points')).toHaveTextContent('1')
    await user.click(screen.getByText('reveal-flashcard')) // re-reveal the same card
    expect(screen.getByTestId('points')).toHaveTextContent('1') // still 1, not 2 -- no double-award
  })

  it('does award again for a genuinely DIFFERENT flashcard', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('reveal-flashcard'))
    await user.click(screen.getByText('reveal-other-flashcard'))
    expect(screen.getByTestId('points')).toHaveTextContent('2')
  })

  it('awards the biggest point value for completing a system-design challenge', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('complete-design-challenge'))
    expect(screen.getByTestId('points')).toHaveTextContent('100')
  })

  it('never double-awards the same page for the same kind, even if clicked repeatedly', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('mark-foo'))
    await user.click(screen.getByText('mark-foo'))
    await user.click(screen.getByText('mark-foo'))
    expect(screen.getByTestId('points')).toHaveTextContent('10') // still just once
  })

  it('marking AND completing different real pages both count toward points', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('mark-foo'))
    await user.click(screen.getByText('mark-bar'))
    await user.click(screen.getByText('complete-problem-1'))
    expect(screen.getByTestId('points')).toHaveTextContent(String(10 + 10 + 50))
  })

  it('a real multi-day streak: activity on 3 genuinely consecutive days builds a real 3-day streak', async () => {
    const { rerender } = setup()
    const user = userEvent.setup()

    await user.click(screen.getByText('mark-foo'))
    expect(screen.getByTestId('streak')).toHaveTextContent('1')

    advanceDays(1)
    rerender(
      <AuthProvider>
        <GamificationProvider>
          <Harness />
        </GamificationProvider>
      </AuthProvider>,
    )
    await user.click(screen.getByText('mark-bar'))
    expect(screen.getByTestId('streak')).toHaveTextContent('2')

    advanceDays(1)
    rerender(
      <AuthProvider>
        <GamificationProvider>
          <Harness />
        </GamificationProvider>
      </AuthProvider>,
    )
    await user.click(screen.getByText('complete-problem-1'))
    expect(screen.getByTestId('streak')).toHaveTextContent('3')
  })

  it('a genuinely missed day resets the streak back to 0', async () => {
    const { rerender } = setup()
    const user = userEvent.setup()

    await user.click(screen.getByText('mark-foo'))
    expect(screen.getByTestId('streak')).toHaveTextContent('1')

    advanceDays(3) // skip two full days with no activity
    rerender(
      <AuthProvider>
        <GamificationProvider>
          <Harness />
        </GamificationProvider>
      </AuthProvider>,
    )
    expect(screen.getByTestId('streak')).toHaveTextContent('0')
  })
})

describe('GamificationContext: practice-problem permalink migration (old /docs/practice-problems/<slug> -> /practice/<slug>)', () => {
  it('an old-style stored award is read under its real, current /practice/<slug> permalink -- re-completing the SAME problem at its new URL does not double-award it', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ permalink: '/docs/practice-problems/dot-product', kind: 'complete', date: '2026-09-01', points: 50 }]),
    )

    function MigrationHarness() {
      const { points, awardProblemCompleted } = useGamification()
      return (
        <div>
          <div data-testid="points">{points}</div>
          <button onClick={() => awardProblemCompleted('/practice/dot-product', 'medium')}>complete-again</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <GamificationProvider>
          <MigrationHarness />
        </GamificationProvider>
      </AuthProvider>,
    )

    expect(await screen.findByTestId('points')).toHaveTextContent('50')
    const user = userEvent.setup()
    await user.click(screen.getByText('complete-again'))
    // Still 50, not 100 -- hasAward() checked the ALREADY-migrated in-memory
    // permalink and correctly recognized this as the same, already-earned
    // problem, so no new event was ever committed (award() returns early --
    // the on-disk old-style key is left as-is until a REAL write happens,
    // which is fine: readStorage() re-normalizes it every load regardless).
    expect(screen.getByTestId('points')).toHaveTextContent('50')
  })
})

describe('GamificationContext: Firestore merge on sign-in', () => {
  const fakeUser = { uid: 'user-1' } as unknown as User

  it('merges local events into Firestore without double-counting an award that exists on both sides', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ permalink: '/docs/foo', kind: 'mark', date: '2026-09-10', points: 10 }]),
    )
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      ;(callback as (u: User) => void)(fakeUser)
      return () => {}
    })
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        gamificationEvents: [
          { permalink: '/docs/foo', kind: 'mark', date: '2026-09-09', points: 10 }, // same permalink+kind -- a real dupe across devices
          { permalink: '/docs/bar', kind: 'mark', date: '2026-09-09', points: 10 }, // remote-only, must survive the merge
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    setup()

    await waitFor(() => expect(setDoc).toHaveBeenCalled())
    const written = vi.mocked(setDoc).mock.calls[0][1] as { gamificationEvents: unknown[] }
    expect(written.gamificationEvents).toHaveLength(2) // deduped, not 3
  })
})
