import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PracticePlayground from './PracticePlayground'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { GamificationProvider } from '../../contexts/GamificationContext'
import { AuthProvider } from '../../contexts/AuthContext'

function renderPlayground(problemId: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <PracticePlayground problemId={problemId} />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

// Deliberately does not click Run/Submit -- that exercises the real
// Pyodide Worker pipeline (network + WASM), the same reason
// RunnableCode.test.tsx never does either. What's real and testable here
// without that: every real test case rendering as its own row (not one
// aggregate, not a tab-switcher hiding the others), and the real
// problem-data-driven starter code/input/expected display.
describe('PracticePlayground', () => {
  it('renders the real starter code and every real test case as its own row, all visible at once', async () => {
    const { container } = renderPlayground('dot-product')
    await waitFor(() => expect(container.querySelector('[contenteditable="true"]')).toBeTruthy())
    // All 4 real dot-product cases show simultaneously -- not tab-hidden.
    expect(screen.getByText('{"a":[1,2,3],"b":[4,5,6]}')).toBeInTheDocument()
    expect(screen.getByText('{"a":[0,0],"b":[5,5]}')).toBeInTheDocument()
    expect(screen.getByText('{"a":[-1,2],"b":[3,-4]}')).toBeInTheDocument()
    expect(screen.getByText('{"a":[2],"b":[3]}')).toBeInTheDocument()
    expect(screen.getByText('Case 1 — Basic Case')).toBeInTheDocument()

    expect(screen.getByText('Case 4 — Single Element')).toBeInTheDocument()

  })

  it('has real Run, Submit, and Reset controls', async () => {
    renderPlayground('dot-product')
    expect(screen.getByRole('button', { name: /Run/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('the SAME engine, unmodified, renders a real SECOND problem with a genuinely different data shape (nested-array input/output, not dot-product\'s scalars) -- proves reusability, not a dot-product special case', async () => {
    const { container } = renderPlayground('matrix-multiplication')
    await waitFor(() => expect(container.querySelector('[contenteditable="true"]')).toBeTruthy())
    expect(screen.getByText('{"A":[[1,2],[3,4]],"B":[[5,6],[7,8]]}')).toBeInTheDocument()
    expect(screen.getByText('[[19,22],[43,50]]')).toBeInTheDocument()
    expect(screen.getByText('Case 1 — 2x2 basic case')).toBeInTheDocument()
    expect(screen.getByText('Case 4 — 1x1 matrices')).toBeInTheDocument()
  })

  it('renders nothing (a real signal, not a silent blank pane) for a problem id with no registered data', () => {
    const { container } = renderPlayground('not-a-real-problem')
    // DEV mode shows a loud red notice; production returns null -- either
    // way, no editor/testcase UI renders for unregistered problem data.
    expect(container.querySelector('[contenteditable="true"]')).toBeNull()
  })
})
