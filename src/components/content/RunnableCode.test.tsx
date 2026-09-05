import type { ComponentProps } from 'react'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import RunnableCode from './RunnableCode'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { GamificationProvider } from '../../contexts/GamificationContext'
import { AuthProvider } from '../../contexts/AuthContext'

function renderRunnable(props: ComponentProps<typeof RunnableCode>) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          <GamificationProvider>
            <RunnableCode {...props} />
          </GamificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('RunnableCode: CodeMirror editor swap', () => {
  // Deliberately does not click "Run" -- that exercises the Pyodide Worker
  // pipeline, which this change never touched (see CodeEditor.tsx's own
  // docstring) and which this repo has no existing Worker-mocking harness
  // for. This test covers exactly what changed: the input surface.

  it('mounts the real CodeMirror editor (via Suspense) with the seed code, not just a bare textarea', async () => {
    const { container } = renderRunnable({ code: 'def add(a, b):\n    return a + b' })
    // Wait specifically for the real CM6 contenteditable region, not just
    // "some text matching /def add/" -- the Suspense fallback textarea also
    // renders that text instantly (its value IS the seed code), so a bare
    // findByText would pass even if the lazy CodeEditor chunk never
    // resolved at all. This is the actual, meaningful assertion.
    const editable = await waitFor(() => {
      const el = container.querySelector('[contenteditable="true"][data-language="python"]')
      expect(el).toBeTruthy()
      return el as HTMLElement
    })
    expect(editable.textContent).toContain('return a + b')
  })

  it('still renders the assert-based tests block below the editor for "implement it yourself" mode', async () => {
    const { container, findByText } = renderRunnable({
      code: 'def double(x):\n    pass',
      tests: 'assert double(2) == 4',
    })
    await waitFor(() => {
      expect(container.querySelector('[contenteditable="true"][data-language="python"]')).toBeTruthy()
    })
    expect(await findByText(/assert double\(2\) == 4/)).toBeInTheDocument()
  })
})

