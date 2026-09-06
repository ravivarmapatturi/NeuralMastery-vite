import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { AuthProvider } from './AuthContext'
import { GamificationProvider, useGamification } from './GamificationContext'
import { ProgressProvider, useProgress } from './ProgressContext'

/**
 * Real bug this guards against, found via direct production trace
 * logging: a Firestore setDoc() call was observed to never resolve OR
 * reject at all for over 40 real seconds after a sign-out/sign-in cycle
 * (the document itself, verified via a direct SDK read, had the correct
 * data the entire time -- this was a client-side hang, never real data
 * loss). withRetry's original implementation only reacted to a REJECTED
 * promise; a call that just hangs forever never triggers its catch
 * block, so the retry loop waits on that single hung attempt forever and
 * never even reaches a second one. The fix races each attempt against
 * its own timeout. This file simulates a permanently-hanging call
 * (a promise that never settles) and asserts the retry loop still makes
 * progress and eventually succeeds.
 */
const store: Record<string, Record<string, unknown> | undefined> = {}
let hangFirstCall = false

vi.mocked(doc).mockImplementation((_db: unknown, ...pathParts: string[]) => ({ path: pathParts.join('/') }) as never)
vi.mocked(getDoc).mockImplementation(async (ref: unknown) => {
  const path = (ref as { path: string }).path
  const data = store[path]
  return { exists: () => data !== undefined, data: () => data } as never
})
vi.mocked(setDoc).mockImplementation((ref: unknown, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
  if (hangFirstCall) {
    hangFirstCall = false // only the very first call hangs; subsequent retries succeed normally
    return new Promise(() => {}) // a promise that never resolves or rejects
  }
  const path = (ref as { path: string }).path
  store[path] = opts?.merge ? { ...(store[path] ?? {}), ...data } : data
  return Promise.resolve()
})
vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
  const path = (ref as unknown as { path: string }).path
  ;(callback as (snap: unknown) => void)({ exists: () => store[path] !== undefined, data: () => store[path] })
  return () => {}
})

const fakeUser = { uid: 'user-hanging-call', getIdToken: vi.fn().mockResolvedValue('fake-token') } as unknown as User

function GamificationTestApp() {
  const { awardMarkUnderstood, events } = useGamification()
  return (
    <div>
      <button onClick={() => awardMarkUnderstood('/docs/some-problem')}>earn points</button>
      <div data-testid="events-count">{events.length}</div>
    </div>
  )
}

function ProgressTestApp() {
  const { toggle, understood } = useProgress()
  return (
    <div>
      <button onClick={() => toggle('/docs/some-lesson')}>mark understood</button>
      <div data-testid="understood-count">{Object.keys(understood).length}</div>
    </div>
  )
}

describe('withRetry survives a Firestore call that hangs forever (never resolves or rejects)', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k]
    hangFirstCall = false
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: unknown, cb: (u: User) => void) => {
      cb(fakeUser)
      return () => {}
    })
  }, 15000)

  it(
    'GamificationContext: commit() still succeeds after its first setDoc attempt hangs forever',
    async () => {
      const user = userEvent.setup()
      const { getByText, getByTestId } = render(
        <AuthProvider>
          <GamificationProvider>
            <GamificationTestApp />
          </GamificationProvider>
        </AuthProvider>,
      )
      await waitFor(() => expect(store['progress/user-hanging-call']).toBeDefined())
      // Signing in already earned today's real automatic daily sign-in
      // award (see GamificationContext's sign-in effect) -- 1 event
      // before this test's own click, not 0.
      await waitFor(() => expect(getByTestId('events-count').textContent).toBe('1'))

      hangFirstCall = true
      await user.click(getByText('earn points'))

      await waitFor(() => expect(getByTestId('events-count').textContent).toBe('2'), { timeout: 12000 })
      await waitFor(() => expect(store['progress/user-hanging-call']?.gamificationEvents).toHaveLength(2), { timeout: 12000 })
    },
    15000,
  )

  it(
    'ProgressContext: the sign-in sync effect still succeeds after its getDoc attempt hangs forever',
    async () => {
      hangFirstCall = false // this test hangs getDoc instead; see below
      vi.mocked(getDoc).mockImplementationOnce(() => new Promise(() => {}))

      const { getByText, getByTestId } = render(
        <AuthProvider>
          <ProgressProvider>
            <ProgressTestApp />
          </ProgressProvider>
        </AuthProvider>,
      )

      await waitFor(() => expect(store['progress/user-hanging-call']).toBeDefined(), { timeout: 12000 })

      const user = userEvent.setup()
      await user.click(getByText('mark understood'))
      await waitFor(() => expect(getByTestId('understood-count').textContent).toBe('1'))
    },
    15000,
  )
})
