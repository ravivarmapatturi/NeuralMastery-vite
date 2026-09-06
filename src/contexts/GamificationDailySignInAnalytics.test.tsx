import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { AuthProvider } from './AuthContext'
import { GamificationProvider, useGamification } from './GamificationContext'

// Mocks lib/firebase.ts directly (auth/db as plain stand-ins -- the real
// Firestore calls go through the separately-mocked firebase/firestore
// module below, same as every other GamificationContext test) so this
// file can assert on trackFeatureEvent itself, rather than the network-
// level GA4 request (which depends on Google's own Consent Mode SDK
// internals under this app's default-denied consent posture -- not
// something a unit test can reliably observe or should be asserting on;
// see lib/trackPageView.test.ts for the "does logEvent get called
// correctly" boundary this app's tests actually own).
vi.mock('../lib/firebase', () => ({
  auth: {},
  db: {},
  trackFeatureEvent: vi.fn().mockResolvedValue(undefined),
  trackPageView: vi.fn().mockResolvedValue(undefined),
}))

const fakeUser = { uid: 'user-daily-signin-analytics', getIdToken: vi.fn().mockResolvedValue('fake-token') } as unknown as User

function Harness() {
  useGamification()
  return null
}

describe('GamificationContext: daily_signin_reward GA4 event', () => {
  beforeEach(() => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      ;(callback as (u: User) => void)(fakeUser)
      return () => {}
    })
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => undefined } as unknown as Awaited<ReturnType<typeof getDoc>>)
    vi.mocked(setDoc).mockResolvedValue(undefined)
  })

  it('fires a real daily_signin_reward event exactly once when the real daily award is granted', async () => {
    const { trackFeatureEvent } = await import('../lib/firebase')
    render(
      <AuthProvider>
        <GamificationProvider>
          <Harness />
        </GamificationProvider>
      </AuthProvider>,
    )

    await waitFor(() => expect(setDoc).toHaveBeenCalled())
    const dailyRewardCalls = vi.mocked(trackFeatureEvent).mock.calls.filter(([name]) => name === 'daily_signin_reward')
    expect(dailyRewardCalls).toHaveLength(1)
    expect(dailyRewardCalls[0][1]).toMatchObject({ points: 15 })
  })
})
