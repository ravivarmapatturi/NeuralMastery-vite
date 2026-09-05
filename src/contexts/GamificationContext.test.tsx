import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'
import { GamificationProvider, useGamification } from './GamificationContext'
import { AuthProvider } from './AuthContext'

const STORAGE_KEY = 'neural-mastery-gamification'

function Harness() {
  const { points, weeklyPoints, streak, awardMarkUnderstood, awardProblemCompleted } = useGamification()
  return (
    <div>
      <div data-testid="points">{points}</div>
      <div data-testid="weekly">{weeklyPoints}</div>
      <div data-testid="streak">{streak}</div>
      <button onClick={() => awardMarkUnderstood('/docs/foo')}>mark-foo</button>
      <button onClick={() => awardMarkUnderstood('/docs/bar')}>mark-bar</button>
      <button onClick={() => awardProblemCompleted('/docs/problem-1')}>complete-problem-1</button>
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
