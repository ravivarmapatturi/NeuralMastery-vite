import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { ProgressProvider, useProgress, REVIEW_INTERVALS_DAYS } from './ProgressContext'
import { AuthProvider } from './AuthContext'

const STORAGE_KEY = 'neural-mastery-progress'
const DAY_MS = 24 * 60 * 60 * 1000
const BASE_TIME = new Date('2026-01-01T00:00:00.000Z').getTime()

/** Exposes useProgress()'s state as plain visible text/buttons -- this
 * project has no renderHook convention, so drive it the same way every
 * other test here drives a real component: through the DOM. */
function Harness({ permalink = '/docs/foo' }: { permalink?: string }) {
  const { isUnderstood, toggle, dueForReview, markReviewed, understood } = useProgress()
  return (
    <div>
      <div data-testid="understood">{String(isUnderstood(permalink))}</div>
      <div data-testid="due">{dueForReview.includes(permalink) ? 'due' : 'not-due'}</div>
      <div data-testid="stage">{String(understood[permalink]?.stage ?? 'none')}</div>
      <button onClick={() => toggle(permalink)}>toggle</button>
      <button onClick={() => markReviewed(permalink)}>reviewed</button>
    </div>
  )
}

function setup(permalink?: string) {
  const { rerender, ...rest } = render(
    <AuthProvider>
      <ProgressProvider>
        <Harness permalink={permalink} />
      </ProgressProvider>
    </AuthProvider>,
  )
  // Re-render with an identical tree to force ProgressProvider's function
  // body (and its Date.now()-driven dueForReview computation) to re-run
  // against whatever `now` currently mocks to -- ProgressProvider's own
  // internal state doesn't depend on this prop, so this never remounts it
  // or resets `understood`, it just re-evaluates render-time values.
  const refresh = () =>
    rerender(
      <AuthProvider>
        <ProgressProvider>
          <Harness permalink={permalink} />
        </ProgressProvider>
      </AuthProvider>,
    )
  return { rerender, refresh, ...rest }
}

let now = BASE_TIME

beforeEach(() => {
  window.localStorage.clear()
  now = BASE_TIME
  // The mocked firebase/auth + firebase/firestore functions (from
  // tests/unit/setup.ts) are shared vi.fn() instances across every test in
  // this file -- clear only their CALL HISTORY here (not their
  // implementations, which individual tests below override on purpose),
  // so a later test's "was this called" assertion never sees an earlier
  // test's leftover calls.
  vi.clearAllMocks()
  // Real timers throughout (userEvent + fake timers is a known, finicky
  // combination) -- only Date.now() itself is mocked, which is all this
  // code actually reads. advanceTime() below moves the mocked clock
  // forward explicitly, on demand.
  vi.spyOn(Date, 'now').mockImplementation(() => now)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function advanceTime(ms: number) {
  now += ms
}

describe('ProgressContext: practice-problem permalink migration (old /docs/practice-problems/<slug> -> /practice/<slug>)', () => {
  it('reads an old-style stored key as understood under its real, current /practice/<slug> permalink', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ '/docs/practice-problems/dot-product': true }))
    const { refresh } = setup('/practice/dot-product')
    expect(await screen.findByText('true')).toBeInTheDocument()
    refresh()
    expect(screen.getByTestId('understood')).toHaveTextContent('true')
  })

  it('the old overview.mdx permalink migrates to /practice (the real list page), not a slug-shaped path', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ '/docs/practice-problems/overview': true }))
    const { refresh } = setup('/practice')
    expect(await screen.findByText('true')).toBeInTheDocument()
    refresh()
  })

  it('a non-practice-problems permalink is left completely untouched by the migration', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ '/docs/deep-learning/attention-transformers': true }))
    const { refresh } = setup('/docs/deep-learning/attention-transformers')
    expect(await screen.findByText('true')).toBeInTheDocument()
    refresh()
  })
})

describe('ProgressContext: legacy boolean-format migration', () => {
  it('reads an old bare-`true` entry as understood, with no review schedule and never due', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ '/docs/foo': true }))
    const { refresh } = setup()
    // The provider's own useEffect reads storage on mount (after first paint) -- wait for it.
    expect(await screen.findByText('true')).toBeInTheDocument()
    expect(screen.getByTestId('stage')).toHaveTextContent('none')
    expect(screen.getByTestId('due')).toHaveTextContent('not-due')

    // Even a full year later, a legacy entry (no markedAt) is still never due.
    advanceTime(365 * DAY_MS)
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('not-due')
  })

  it('does not corrupt or drop a legacy entry when a DIFFERENT page is toggled', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ '/docs/legacy': true }))
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <ProgressProvider>
          <Harness permalink="/docs/legacy" />
          <Harness permalink="/docs/new" />
        </ProgressProvider>
      </AuthProvider>,
    )
    const toggleButtons = await screen.findAllByText('toggle')
    await user.click(toggleButtons[1]) // mark the NEW page, not the legacy one
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)
    expect(stored['/docs/legacy']).toEqual({ understood: true }) // untouched, still legacy shape on disk
    expect(stored['/docs/new']).toMatchObject({ understood: true, markedAt: expect.any(Number), stage: 0 })
  })
})

describe('ProgressContext: marking, toggling, un-marking', () => {
  it('toggle marks a page understood with a fresh markedAt and stage 0', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle'))
    expect(screen.getByTestId('understood')).toHaveTextContent('true')
    expect(screen.getByTestId('stage')).toHaveTextContent('0')
  })

  it('toggling an understood page off removes it entirely (and its review schedule)', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle')) // on
    await user.click(screen.getByText('toggle')) // off
    expect(screen.getByTestId('understood')).toHaveTextContent('false')
    expect(screen.getByTestId('stage')).toHaveTextContent('none')
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)
    expect(stored['/docs/foo']).toBeUndefined()
  })
})

describe('ProgressContext: spaced-repetition date math', () => {
  it('is NOT due one second before the stage-0 interval elapses, and IS due one second after', async () => {
    const { refresh } = setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle')) // marks "now" (BASE_TIME), stage 0

    advanceTime(REVIEW_INTERVALS_DAYS[0] * DAY_MS - 1000)
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('not-due')

    advanceTime(2000) // now 1s past the exact boundary
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('due')
  })

  it('is due at exactly the interval boundary (>=, not strictly >)', async () => {
    const { refresh } = setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle'))

    advanceTime(REVIEW_INTERVALS_DAYS[0] * DAY_MS) // exactly on the boundary
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('due')
  })

  it('markReviewed advances the stage and pushes the next due date out to the NEXT (longer) interval', async () => {
    const { refresh } = setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle')) // stage 0

    advanceTime(REVIEW_INTERVALS_DAYS[0] * DAY_MS + 1000) // now due
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('due')

    await user.click(screen.getByText('reviewed'))
    expect(screen.getByTestId('stage')).toHaveTextContent('1')
    expect(screen.getByTestId('due')).toHaveTextContent('not-due') // just reviewed -- not due again immediately

    // Stage 1's interval (3 days) elapsing should make it due again --
    // if markReviewed had incorrectly kept re-using stage 0's interval,
    // this would already be "due" one day early.
    advanceTime(REVIEW_INTERVALS_DAYS[0] * DAY_MS + 1000) // stage-0-sized gap elapsed again
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('not-due') // stage 1's LONGER interval hasn't elapsed yet

    advanceTime((REVIEW_INTERVALS_DAYS[1] - REVIEW_INTERVALS_DAYS[0]) * DAY_MS)
    refresh()
    expect(screen.getByTestId('due')).toHaveTextContent('due')
  })

  it('stage never advances past the last interval (caps at the ladder end)', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle'))
    for (let i = 0; i < REVIEW_INTERVALS_DAYS.length + 3; i += 1) {
      advanceTime(40 * DAY_MS) // always well past every interval
      await user.click(screen.getByText('reviewed'))
    }
    expect(screen.getByTestId('stage')).toHaveTextContent(String(REVIEW_INTERVALS_DAYS.length - 1))
  })
})

// Explicit per-test setup/teardown of the mocked Firebase functions here
// (rather than relying on the file-level afterEach's vi.restoreAllMocks())
// -- these tests need specific onAuthStateChanged/getDoc/onSnapshot
// behavior, and every test below restores the exact signed-out defaults
// from tests/unit/setup.ts afterward so no later test in this file (or
// this describe block) can inherit a stale signed-in mock.
describe('ProgressContext: Firestore sync for signed-in users', () => {
  const fakeUser = { uid: 'user-1' } as unknown as User

  function mockSignedIn(remoteData: unknown) {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      ;(callback as (u: User) => void)(fakeUser)
      return () => {}
    })
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => remoteData !== undefined,
      data: () => remoteData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  afterEach(() => {
    // Restore the exact signed-out defaults from tests/unit/setup.ts.
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      ;(callback as (u: null) => void)(null)
      return () => {}
    })
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => undefined } as unknown as Awaited<ReturnType<typeof getDoc>>)
    vi.mocked(setDoc).mockResolvedValue(undefined)
    vi.mocked(onSnapshot).mockImplementation(() => () => {})
  })

  it('merges local progress into whatever is already in Firestore on sign-in, keeping the more-advanced entry per page where both sides have one', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        '/docs/local-only': { understood: true, markedAt: BASE_TIME, stage: 0 },
        '/docs/both': { understood: true, markedAt: BASE_TIME, stage: 0 }, // local is behind on this one
      }),
    )
    mockSignedIn({
      understood: {
        '/docs/remote-only': { understood: true, markedAt: BASE_TIME, stage: 1 },
        '/docs/both': { understood: true, markedAt: BASE_TIME + 1000, stage: 2 }, // remote is further along
      },
    })

    setup()

    await waitFor(() => expect(setDoc).toHaveBeenCalled())
    const written = vi.mocked(setDoc).mock.calls[0][1] as { understood: Record<string, unknown> }
    // Neither side's page disappears, and the higher-stage ("both") entry wins.
    expect(written.understood['/docs/local-only']).toEqual({ understood: true, markedAt: BASE_TIME, stage: 0 })
    expect(written.understood['/docs/remote-only']).toEqual({ understood: true, markedAt: BASE_TIME, stage: 1 })
    expect(written.understood['/docs/both']).toEqual({ understood: true, markedAt: BASE_TIME + 1000, stage: 2 })
  })

  it('never loses the local side of a page that Firestore does not have yet on a brand-new account', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ '/docs/only-local': { understood: true, markedAt: BASE_TIME, stage: 3 } }))
    mockSignedIn(undefined) // no Firestore document exists yet for this uid

    setup()

    await waitFor(() => expect(setDoc).toHaveBeenCalled())
    const written = vi.mocked(setDoc).mock.calls[0][1] as { understood: Record<string, unknown> }
    expect(written.understood['/docs/only-local']).toEqual({ understood: true, markedAt: BASE_TIME, stage: 3 })
  })

  it('drives displayed state from the Firestore onSnapshot listener, never from a direct local write, while signed in', async () => {
    mockSignedIn(undefined)
    let deliverSnapshot: ((snap: unknown) => void) | undefined
    vi.mocked(onSnapshot).mockImplementation((_ref, callback) => {
      deliverSnapshot = callback as (snap: unknown) => void
      return () => {}
    })

    setup('/docs/from-remote')
    await waitFor(() => expect(deliverSnapshot).toBeDefined())

    deliverSnapshot!({
      exists: () => true,
      data: () => ({ understood: { '/docs/from-remote': { understood: true, markedAt: BASE_TIME, stage: 0 } } }),
    })

    await waitFor(() => expect(screen.getByTestId('understood')).toHaveTextContent('true'))
  })
})

describe('ProgressContext: signed-out visitors never touch Firestore', () => {
  it('toggling a page while signed out never calls getDoc/setDoc/onSnapshot -- localStorage-only, no regression', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('toggle'))
    expect(getDoc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
    expect(onSnapshot).not.toHaveBeenCalled()
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toHaveProperty('/docs/foo')
  })
})
