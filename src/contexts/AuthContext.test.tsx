import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { AuthProvider, useAuth } from './AuthContext'

function Harness() {
  const { signUpWithEmail, signInWithEmail } = useAuth()
  return (
    <div>
      <button onClick={() => signUpWithEmail('new@example.com', 'realpassword')}>sign-up</button>
      <button onClick={() => signInWithEmail('existing@example.com', 'realpassword')}>sign-in</button>
    </div>
  )
}

function setup() {
  return render(
    <AuthProvider>
      <Harness />
    </AuthProvider>,
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('AuthContext: email/password', () => {
  it('signUpWithEmail calls the real Firebase createUserWithEmailAndPassword with the given credentials', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('sign-up'))
    await waitFor(() => expect(createUserWithEmailAndPassword).toHaveBeenCalled())
    const call = vi.mocked(createUserWithEmailAndPassword).mock.calls[0]
    expect(call[1]).toBe('new@example.com')
    expect(call[2]).toBe('realpassword')
  })

  it('signInWithEmail calls the real Firebase signInWithEmailAndPassword with the given credentials', async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('sign-in'))
    await waitFor(() => expect(signInWithEmailAndPassword).toHaveBeenCalled())
    const call = vi.mocked(signInWithEmailAndPassword).mock.calls[0]
    expect(call[1]).toBe('existing@example.com')
    expect(call[2]).toBe('realpassword')
  })

  it('a real sign-up failure (email-already-in-use, the exact collision that must never silently succeed) propagates to the caller instead of being swallowed', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
      Object.assign(new Error('already in use'), { code: 'auth/email-already-in-use' }),
    )

    function ThrowCatcher() {
      const { signUpWithEmail } = useAuth()
      return (
        <button
          onClick={async () => {
            try {
              await signUpWithEmail('taken@example.com', 'realpassword')
            } catch (e) {
              document.getElementById('caught')!.textContent = (e as { code?: string }).code ?? 'unknown'
            }
          }}
        >
          try-signup
        </button>
      )
    }
    render(
      <AuthProvider>
        <div id="caught" />
        <ThrowCatcher />
      </AuthProvider>,
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('try-signup'))
    await waitFor(() => expect(document.getElementById('caught')!.textContent).toBe('auth/email-already-in-use'))
  })
})
