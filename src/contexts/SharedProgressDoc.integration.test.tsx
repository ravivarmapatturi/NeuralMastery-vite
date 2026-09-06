import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { AuthProvider } from './AuthContext'
import { ProgressProvider, useProgress } from './ProgressContext'
import { GamificationProvider, useGamification } from './GamificationContext'

/**
 * Real reproduction of a real bug: ProgressContext and GamificationContext
 * both write to the SAME Firestore `progress/{uid}` document (`understood`
 * and `gamificationEvents` respectively, as sibling fields) -- but each
 * context's per-action commit() only ever unit-tests its OWN field in
 * isolation, so neither context's own test suite could ever catch one
 * context's write wiping out the other's field. This file exists
 * specifically to test the two together, sharing one fake Firestore
 * backing store, the way they actually share one real document in
 * production.
 *
 * Real user impact this reproduces: a signed-in user who marks pages
 * understood AND earns gamification points across a real session sees
 * their points/streak (or their understood-pages checklist) appear to
 * reset, because whichever context wrote LAST silently deleted the
 * other's field via a bare `setDoc` (no `{ merge: true }`) -- a full
 * document replace, not a partial update. Fixed by adding `merge: true`
 * to both contexts' per-action setDoc calls (their initial sign-in-merge
 * writes already correctly used it; only the steady-state per-award/
 * per-toggle writes were missing it).
 */
const store: Record<string, Record<string, unknown> | undefined> = {}

vi.mocked(doc).mockImplementation((_db: unknown, ...pathParts: string[]) => ({ path: pathParts.join('/') }) as never)
vi.mocked(getDoc).mockImplementation(async (ref: unknown) => {
  const path = (ref as { path: string }).path
  const data = store[path]
  return { exists: () => data !== undefined, data: () => data } as never
})
vi.mocked(setDoc).mockImplementation(async (ref: unknown, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
  const path = (ref as { path: string }).path
  store[path] = opts?.merge ? { ...(store[path] ?? {}), ...data } : data // real Firestore: no merge = full document replace
})
vi.mocked(onSnapshot).mockImplementation((_ref, callback) => {
  const cb = callback as (snap: unknown) => void
  const path = (_ref as unknown as { path: string }).path
  cb({ exists: () => store[path] !== undefined, data: () => store[path] })
  return () => {}
})

const fakeUser = { uid: 'user-shared-doc' } as unknown as User

function TestApp() {
  const { toggle } = useProgress()
  const { awardMarkUnderstood, events } = useGamification()
  return (
    <div>
      <button onClick={() => toggle('/docs/some-lesson')}>mark understood (Progress)</button>
      <button onClick={() => awardMarkUnderstood('/docs/some-problem')}>earn points (Gamification)</button>
      <div data-testid="events-count">{events.length}</div>
    </div>
  )
}

function renderApp() {
  return render(
    <AuthProvider>
      <ProgressProvider>
        <GamificationProvider>
          <TestApp />
        </GamificationProvider>
      </ProgressProvider>
    </AuthProvider>,
  )
}

describe('ProgressContext + GamificationContext: shared progress/{uid} document', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k]
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: unknown, cb: (u: User) => void) => {
      cb(fakeUser)
      return () => {}
    })
  })

  it('marking a page understood does not delete a previously-written gamificationEvents field', async () => {
    const user = userEvent.setup()
    const { getByText } = renderApp()
    await waitFor(() => expect(store['progress/user-shared-doc']).toBeDefined())

    await user.click(getByText('earn points (Gamification)'))
    await waitFor(() => expect(store['progress/user-shared-doc']?.gamificationEvents).toBeDefined())

    await user.click(getByText('mark understood (Progress)'))
    await waitFor(() => expect(store['progress/user-shared-doc']?.understood).toBeDefined())

    // The real bug: this used to be undefined after the line above.
    expect(store['progress/user-shared-doc']?.gamificationEvents).toBeDefined()
  })

  it('earning points does not delete a previously-written understood field', async () => {
    const user = userEvent.setup()
    const { getByText } = renderApp()
    await waitFor(() => expect(store['progress/user-shared-doc']).toBeDefined())

    await user.click(getByText('mark understood (Progress)'))
    await waitFor(() => expect(store['progress/user-shared-doc']?.understood).toBeDefined())

    await user.click(getByText('earn points (Gamification)'))
    await waitFor(() => expect(store['progress/user-shared-doc']?.gamificationEvents).toBeDefined())

    // The symmetric direction of the same real bug.
    expect(store['progress/user-shared-doc']?.understood).toBeDefined()
  })
})
