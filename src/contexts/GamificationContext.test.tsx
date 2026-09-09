import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { GamificationProvider, useGamification } from './GamificationContext'
import { AuthProvider } from './AuthContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function Harness() {
  const { points, weeklyPoints, streak, awardMarkUnderstood, awardProblemCompleted, awardSystemDesignCompleted, awardFlashcardRevealed, awardArchitectureCompleted } = useGamification()
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
      <button onClick={() => awardArchitectureCompleted('/practice/react-agent-loop')}>complete-architecture</button>
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
  // Real gap this closes: restoreAllMocks() also wipes doc()'s
  // implementation (a bare vi.fn() from the firebase/firestore mock
  // factory has no "original" to restore to), and this block re-mocks
  // every OTHER Firestore call it uses except this one -- harmless while
  // every async chain finished within its own test, but a straggler
  // promise from a later test (e.g. awardDailySignIn's fire-and-forget
  // commit()) that resolves after cleanup would otherwise call doc()
  // with no implementation.
  vi.mocked(doc).mockImplementation(() => ({}) as ReturnType<typeof doc>)
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

  it('awards points for completing architecture canvas and enforces de-duplication', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('complete-architecture'))
    expect(screen.getByTestId('points')).toHaveTextContent('50')

    // Repeated clicks should NOT double-award
    await user.click(screen.getByText('complete-architecture'))
    expect(screen.getByTestId('points')).toHaveTextContent('50')
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
  const fakeUser = { uid: 'user-1', getIdToken: vi.fn().mockResolvedValue('fake-token') } as unknown as User

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

    // The sign-in effect's own merge now also folds in today's real daily
    // sign-in award (see GamificationContext's sign-in effect) -- so the
    // real, correct write is 3 events: foo + bar deduped from the
    // cross-device merge, plus one real signin:<date> event, not a 4th
    // (a second sign-in today would be the no-op case, not this test).
    await waitFor(() => expect(setDoc).toHaveBeenCalled())
    const written = vi.mocked(setDoc).mock.calls[0][1] as { gamificationEvents: { kind: string }[] }
    expect(written.gamificationEvents).toHaveLength(3)
    expect(written.gamificationEvents.filter((e) => e.kind === 'mark')).toHaveLength(2) // foo+bar, not 3 -- the real dupe was still deduped
    expect(written.gamificationEvents.filter((e) => e.kind === 'signin')).toHaveLength(1)
  })
})

describe('GamificationContext: daily sign-in reward', () => {
  const fakeUser = { uid: 'user-daily-signin', getIdToken: vi.fn().mockResolvedValue('fake-token') } as unknown as User

  // A tiny fake persisted doc, carried FORWARD across separate
  // render/unmount cycles (each standing in for a real, separate sign-in
  // session) -- getDoc/setDoc read and write the same object, exactly
  // like a real Firestore document would.
  let fakeDoc: { gamificationEvents: { permalink: string; kind: string; date: string; points: number }[] } | undefined

  beforeEach(() => {
    fakeDoc = undefined
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      ;(callback as (u: User) => void)(fakeUser)
      return () => {}
    })
    vi.mocked(getDoc).mockImplementation(
      async () => ({ exists: () => fakeDoc !== undefined, data: () => fakeDoc }) as unknown as Awaited<ReturnType<typeof getDoc>>,
    )
    vi.mocked(setDoc).mockImplementation(async (_ref, data) => {
      if ('gamificationEvents' in (data as object)) fakeDoc = data as typeof fakeDoc;
    })
  })

  it('a real sign-in earns exactly one daily reward, not zero and not more than one', async () => {
    setup()
    await waitFor(() => expect(fakeDoc?.gamificationEvents.filter((e) => e.kind === 'signin')).toHaveLength(1))
    expect(fakeDoc?.gamificationEvents[0]).toMatchObject({ permalink: 'signin:2026-09-10', kind: 'signin', points: 15 })
  })

  it('a second real sign-in the SAME real day does not award a second daily reward', async () => {
    const first = setup()
    await waitFor(() => expect(fakeDoc?.gamificationEvents.filter((e) => e.kind === 'signin')).toHaveLength(1))
    first.unmount()

    setup() // a real, separate sign-in session later the same day
    await waitFor(() => expect(screen.getByTestId('points')).toHaveTextContent('15'))
    expect(fakeDoc?.gamificationEvents.filter((e) => e.kind === 'signin')).toHaveLength(1) // still just the one
  })

  it('signing in again on a genuinely later real day earns a real second daily reward', async () => {
    const first = setup()
    await waitFor(() => expect(fakeDoc?.gamificationEvents.filter((e) => e.kind === 'signin')).toHaveLength(1))
    first.unmount()

    advanceDays(1) // tomorrow, a real new calendar day
    setup()
    await waitFor(() => expect(fakeDoc?.gamificationEvents.filter((e) => e.kind === 'signin')).toHaveLength(2))
    expect(fakeDoc?.gamificationEvents.filter((e) => e.kind === 'signin').map((e) => e.permalink)).toEqual([
      'signin:2026-09-10',
      'signin:2026-09-11',
    ])
  })
})
