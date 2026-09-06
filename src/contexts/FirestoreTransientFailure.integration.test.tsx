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
 * Real bug this guards against, reproduced live against production: a
 * Firestore read/write issued immediately after sign-in/sign-up can hit
 * a real, documented Firebase race where the SDK's internal credential
 * listener lags a tick behind `auth.currentUser`, so the request goes
 * out unauthenticated and throws "Missing or insufficient permissions"
 * even though the user genuinely is signed in. Confirmed via a live
 * Playwright repro: fresh sign-up -> immediate mark-understood ->
 * console PAGEERROR "Missing or insufficient permissions" -> sign-out ->
 * sign back in -> the award was gone, because the write never actually
 * reached Firestore and nothing retried it. This file simulates that
 * exact transient failure (reject once, succeed after) and asserts the
 * data survives.
 */
const store: Record<string, Record<string, unknown> | undefined> = {}
let getDocFailuresRemaining = 0
let setDocFailuresRemaining = 0

vi.mocked(doc).mockImplementation((_db: unknown, ...pathParts: string[]) => ({ path: pathParts.join('/') }) as never)
vi.mocked(getDoc).mockImplementation(async (ref: unknown) => {
  if (getDocFailuresRemaining > 0) {
    getDocFailuresRemaining--
    throw new Error('Missing or insufficient permissions.')
  }
  const path = (ref as { path: string }).path
  const data = store[path]
  return { exists: () => data !== undefined, data: () => data } as never
})
vi.mocked(setDoc).mockImplementation(async (ref: unknown, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
  if (setDocFailuresRemaining > 0) {
    setDocFailuresRemaining--
    throw new Error('Missing or insufficient permissions.')
  }
  const path = (ref as { path: string }).path
  store[path] = opts?.merge ? { ...(store[path] ?? {}), ...data } : data
})
vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
  const path = (ref as unknown as { path: string }).path
  ;(callback as (snap: unknown) => void)({ exists: () => store[path] !== undefined, data: () => store[path] })
  return () => {}
})

const fakeUser = { uid: 'user-transient-failure', getIdToken: vi.fn().mockResolvedValue('fake-token') } as unknown as User

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

describe('a transient "Missing or insufficient permissions" error right after sign-in does not lose progress', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k]
    getDocFailuresRemaining = 0
    setDocFailuresRemaining = 0
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: unknown, cb: (u: User) => void) => {
      cb(fakeUser)
      return () => {}
    })
  })

  it('GamificationContext: commit() retries a failed write instead of silently dropping the award', async () => {
    const user = userEvent.setup()
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <GamificationProvider>
          <GamificationTestApp />
        </GamificationProvider>
      </AuthProvider>,
    )
    await waitFor(() => expect(store['progress/user-transient-failure']).toBeDefined())

    setDocFailuresRemaining = 1 // the very next setDoc call throws once, then succeeds
    await user.click(getByText('earn points'))
    await waitFor(() => expect(getByTestId('events-count').textContent).toBe('1'))

    // The real regression: without a retry, this write is silently lost --
    // the Firestore document never actually gets the event.
    await waitFor(() => expect(store['progress/user-transient-failure']?.gamificationEvents).toHaveLength(1))
  })

  it('ProgressContext: the sign-in sync effect retries instead of aborting when getDoc throws once', async () => {
    getDocFailuresRemaining = 1 // the sign-in effect's own getDoc throws once, then succeeds
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <ProgressProvider>
          <ProgressTestApp />
        </ProgressProvider>
      </AuthProvider>,
    )

    // Without a retry, the whole sign-in sync effect aborts silently and
    // `understood` never advances past its initial empty state.
    await waitFor(() => expect(store['progress/user-transient-failure']).toBeDefined())

    const user = userEvent.setup()
    await user.click(getByText('mark understood'))
    await waitFor(() => expect(getByTestId('understood-count').textContent).toBe('1'))
  })
})
