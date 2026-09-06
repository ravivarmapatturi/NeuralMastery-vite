import { render, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { AuthProvider } from './AuthContext'
import { GamificationProvider, useGamification } from './GamificationContext'
import { ProgressProvider, useProgress } from './ProgressContext'

/**
 * Real regression this file guards against: commit a98abae added a merge
 * step to both contexts' onSnapshot listeners specifically to fix
 * cross-device sync (a live snapshot from Firestore used to directly
 * overwrite local state, silently dropping anything this device had
 * locally that the snapshot didn't include yet). Commit 9e1811c
 * (unrelated "clear localStorage on sign-out" change) accidentally
 * reverted that exact merge step back to a direct overwrite in both
 * files -- confirmed via `git log -S "mergeProgress" -- src/contexts/ProgressContext.tsx`.
 * Neither existing test suite caught it because SharedProgressDoc's tests
 * never drive the onSnapshot callback more than once. This file does.
 */
const store: Record<string, Record<string, unknown> | undefined> = {}
let snapshotCallback: ((snap: unknown) => void) | null = null

vi.mocked(doc).mockImplementation((_db: unknown, ...pathParts: string[]) => ({ path: pathParts.join('/') }) as never)
vi.mocked(getDoc).mockImplementation(async (ref: unknown) => {
  const path = (ref as { path: string }).path
  const data = store[path]
  return { exists: () => data !== undefined, data: () => data } as never
})
vi.mocked(setDoc).mockImplementation(async (ref: unknown, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
  const path = (ref as { path: string }).path
  store[path] = opts?.merge ? { ...(store[path] ?? {}), ...data } : data
})
vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
  const path = (ref as unknown as { path: string }).path
  snapshotCallback = callback as (snap: unknown) => void
  ;(callback as (snap: unknown) => void)({ exists: () => store[path] !== undefined, data: () => store[path] })
  return () => {}
})

const fakeUser = { uid: 'user-cross-device', getIdToken: vi.fn().mockResolvedValue('fake-token') } as unknown as User

function GamificationTestApp() {
  const { awardMarkUnderstood, events } = useGamification()
  return (
    <div>
      <button onClick={() => awardMarkUnderstood('/docs/local-only-problem')}>earn local points</button>
      <div data-testid="events-count">{events.length}</div>
    </div>
  )
}

function ProgressTestApp() {
  const { toggle, understood } = useProgress()
  return (
    <div>
      <button onClick={() => toggle('/docs/local-only-lesson')}>mark local page</button>
      <div data-testid="understood-count">{Object.keys(understood).length}</div>
    </div>
  )
}

describe('onSnapshot listeners: a remote update must merge, never overwrite, local progress', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k]
    snapshotCallback = null
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: unknown, cb: (u: User) => void) => {
      cb(fakeUser)
      return () => {}
    })
  })

  it('GamificationContext: a stale/empty snapshot (another device, or an in-flight event) does not wipe this device\'s own just-earned points', async () => {
    const user = userEvent.setup()
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <GamificationProvider>
          <GamificationTestApp />
        </GamificationProvider>
      </AuthProvider>,
    )
    await waitFor(() => expect(store['progress/user-cross-device']).toBeDefined())

    await user.click(getByText('earn local points'))
    await waitFor(() => expect(getByTestId('events-count').textContent).toBe('1'))

    // Simulate a snapshot delivery reflecting server state that doesn't
    // yet include this device's own latest local-only event -- the real
    // shape of both the cross-device case and a stale in-flight listener
    // event around a sign-out/sign-in transition.
    act(() => {
      snapshotCallback?.({ exists: () => true, data: () => ({ gamificationEvents: [] }) })
    })

    await waitFor(() => expect(getByTestId('events-count').textContent).toBe('1'))
  })

  it('ProgressContext: a stale/empty snapshot does not wipe this device\'s own just-marked page', async () => {
    const user = userEvent.setup()
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <ProgressProvider>
          <ProgressTestApp />
        </ProgressProvider>
      </AuthProvider>,
    )
    await waitFor(() => expect(store['progress/user-cross-device']).toBeDefined())

    await user.click(getByText('mark local page'))
    await waitFor(() => expect(getByTestId('understood-count').textContent).toBe('1'))

    act(() => {
      snapshotCallback?.({ exists: () => true, data: () => ({ understood: {} }) })
    })

    await waitFor(() => expect(getByTestId('understood-count').textContent).toBe('1'))
  })
})
