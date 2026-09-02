import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '../../src/theme/ThemeProvider'

/** Shared wrapper for any component test that touches useVizTokens()
 * (directly or via a child) -- basically anything importing from
 * src/theme/vizTokens.ts, which throws outside a real ThemeProvider. */
export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: ThemeProvider, ...options })
}
