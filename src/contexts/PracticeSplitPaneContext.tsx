import { createContext, useContext, type ReactNode } from 'react';

/**
 * Lets RunnableCode (declared inline in a practice problem's MDX, same as
 * on every other page that embeds it) render its editor/Run/test-results
 * panel into a separate DOM node -- PracticeProblemLayout's right-hand
 * "code" pane -- via a React portal, instead of inline where the MDX
 * places it. This is deliberately the ONLY thing this context carries:
 * no MDX file needs to change, and RunnableCode's own execution logic
 * (Worker, Pyodide, test running) is completely untouched. Absent (null)
 * on every page that isn't a split-pane practice problem, in which case
 * RunnableCode falls back to rendering inline exactly as before -- this
 * context is additive, never a required wrapper.
 */
const PracticeSplitPaneContext = createContext<HTMLDivElement | null>(null);

export function usePracticeCodePane(): HTMLDivElement | null {
  return useContext(PracticeSplitPaneContext);
}

export function PracticeSplitPaneProvider({ codePaneEl, children }: { codePaneEl: HTMLDivElement | null; children: ReactNode }) {
  return <PracticeSplitPaneContext.Provider value={codePaneEl}>{children}</PracticeSplitPaneContext.Provider>;
}
