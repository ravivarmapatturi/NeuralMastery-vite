import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProgressProvider, useProgress, REVIEW_INTERVALS_DAYS } from './ProgressContext'

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
    <ProgressProvider>
      <Harness permalink={permalink} />
    </ProgressProvider>,
  )
  // Re-render with an identical tree to force ProgressProvider's function
  // body (and its Date.now()-driven dueForReview computation) to re-run
  // against whatever `now` currently mocks to -- ProgressProvider's own
  // internal state doesn't depend on this prop, so this never remounts it
  // or resets `understood`, it just re-evaluates render-time values.
  const refresh = () =>
    rerender(
      <ProgressProvider>
        <Harness permalink={permalink} />
      </ProgressProvider>,
    )
  return { rerender, refresh, ...rest }
}

let now = BASE_TIME

beforeEach(() => {
  window.localStorage.clear()
  now = BASE_TIME
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
      <ProgressProvider>
        <Harness permalink="/docs/legacy" />
        <Harness permalink="/docs/new" />
      </ProgressProvider>,
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
