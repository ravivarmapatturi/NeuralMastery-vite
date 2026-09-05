import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CodeEditor from './CodeEditor'
import { DARK } from '../../theme/vizTokens'

describe('CodeEditor', () => {
  it('renders the seed code as real editor content', () => {
    // CM6's syntax highlighting splits a line across multiple <span>s (one
    // per token), so the text "def solve" is never in a single text node --
    // container.textContent (which concatenates across nodes) is the real
    // way to check rendered content here, not getByText's per-node match.
    const { container } = render(<CodeEditor value={'def solve():\n    pass'} onChange={() => {}} tokens={DARK} />)
    expect(container.textContent).toContain('def solve')
    expect(container.textContent).toContain('pass')
  })

  it('calls onChange with the real new document text when the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<CodeEditor value="x = 1" onChange={onChange} tokens={DARK} />)
    const editable = container.querySelector('[contenteditable="true"]') as HTMLElement
    expect(editable).toBeTruthy()
    editable.focus()
    await user.keyboard('9')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall).toContain('9')
  })

  it('syncs an external value change into the editor without remounting it', () => {
    const { rerender, container } = render(<CodeEditor value="a = 1" onChange={() => {}} tokens={DARK} />)
    expect(container.textContent).toContain('a = 1')
    rerender(<CodeEditor value="b = 2" onChange={() => {}} tokens={DARK} />)
    expect(container.textContent).toContain('b = 2')
    expect(container.textContent).not.toContain('a = 1')
  })
})
