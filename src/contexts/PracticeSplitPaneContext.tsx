import { createContext, useContext, type ReactNode } from 'react';

/**
 * Lets a problem's embedded runnable component render into a separate DOM
 * node -- PracticeProblemLayout's right-hand pane -- via a React portal,
 * instead of inline where the MDX places it. This is deliberately the
 * ONLY thing this context carries: no MDX file needs to change, and
 * neither RunnableCode's nor PracticePlayground's own execution logic is
 * touched by it. Absent (null) on every page that isn't a split-pane
 * practice problem, in which case both fall back to rendering inline
 * exactly as before -- this context is additive, never a required
 * wrapper.
 *
 * Two separate targets, not one, because PracticePlayground's layout is
 * itself split top (editor) / bottom (per-case testcase list) -- see
 * PracticeProblemLayout.tsx. The legacy RunnableCode (still used by every
 * practice problem not yet migrated to PracticePlayground) is a single
 * self-contained block; it portals into `editorPaneEl` alone and leaves
 * `testcasePaneEl` empty, which PracticeProblemLayout's own CSS collapses
 * rather than reserving dead space for.
 */
export interface PracticeSplitPanes {
  editorPaneEl: HTMLDivElement | null;
  testcasePaneEl: HTMLDivElement | null;
}

const PracticeSplitPaneContext = createContext<PracticeSplitPanes | null>(null);

export function usePracticeSplitPanes(): PracticeSplitPanes | null {
  return useContext(PracticeSplitPaneContext);
}

/** Back-compat single-node accessor for RunnableCode, which only ever
 * needs one portal target for its whole self-contained block. */
export function usePracticeCodePane(): HTMLDivElement | null {
  return useContext(PracticeSplitPaneContext)?.editorPaneEl ?? null;
}

export function PracticeSplitPaneProvider({ panes, children }: { panes: PracticeSplitPanes; children: ReactNode }) {
  return <PracticeSplitPaneContext.Provider value={panes}>{children}</PracticeSplitPaneContext.Provider>;
}
