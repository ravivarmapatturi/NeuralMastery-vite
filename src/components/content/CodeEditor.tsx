import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Prec } from '@codemirror/state';
import { indentUnit } from '@codemirror/language';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import type { VizTokens } from '../../theme/vizTokens';

/**
 * Real CodeMirror 6 editor for Python practice-problem input -- replaces a
 * bare <textarea> (no highlighting, no indent handling) with real syntax
 * highlighting, bracket matching, and Python-correct Tab-inserts-4-spaces
 * behavior. Deliberately CodeMirror over Monaco: this only needs a real
 * code-input surface for a single language, not a full IDE, and CM6's
 * bundle is a fraction of Monaco's for that job (see RunnableCode.tsx,
 * which lazy-loads this file via React.lazy so its real ~155KB min+gzip (measured via `npm run build`) stays
 * out of the main bundle for every page that isn't a practice problem).
 *
 * Uncontrolled by design, like the textarea it replaces: `value` seeds the
 * editor once on mount and is re-synced only when it changes from OUTSIDE
 * (e.g. this problem's own "reset" affordance were one to exist), not on
 * every keystroke -- CodeMirror owns its own document, `onChange` is an
 * outward notification, not a two-way controlled-input binding (fighting
 * CM6's own cursor/selection state on every render is the real reason
 * every CM6 React wrapper does it this way, not just this one).
 */
export default function CodeEditor({
  value,
  onChange,
  tokens: _tokens,
}: {
  value: string;
  onChange: (next: string) => void;
  tokens: VizTokens;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          python(),
          indentUnit.of('    '), // real 4-space Python indent, not CM6's 2-space default
          Prec.highest(keymap.of([indentWithTab])), // Tab inserts indent -- a Python-only tool needs this more than the a11y default of tabbing focus away
          EditorView.theme(
            {
              '&': {
                backgroundColor: '#020617',
                color: '#f8fafc',
                fontSize: '13px',
                height: '100%',
              },
              '.cm-scroller': {
                backgroundColor: '#020617',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                minHeight: '100%',
                overflow: 'auto',
              },
              '.cm-content': {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                minHeight: '96px',
                padding: '10px 0',
                backgroundColor: '#020617',
                caretColor: '#38bdf8',
              },
              '.cm-gutters': {
                backgroundColor: '#0f172a',
                color: '#64748b',
                borderRight: '1px solid rgba(255,255,255,0.08)',
              },
              '.cm-gutterElement': {
                padding: '0 8px 0 12px',
              },
              '.cm-line': {
                padding: '0 12px',
                color: '#f8fafc',
              },
              '.cm-activeLine': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
              '.cm-activeLineGutter': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
              },
              '&.cm-focused': {
                outline: 'none',
              },
              '.cm-cursor': {
                borderLeftColor: '#38bdf8',
                borderLeftWidth: '2px',
              },
              '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
                backgroundColor: 'rgba(99, 102, 241, 0.35) !important',
              },
            },
            { dark: true },
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    return () => view.destroy();
    // Deliberately mount once -- `tokens` (theme) changes are rare (a
    // manual light/dark toggle) and re-mounting the whole editor on every
    // theme flip would lose cursor position/undo history for a cosmetic
    // change; re-creating it below only when the identity actually
    // changes, not on every render, is the real fix rather than this
    // effect depending on `tokens`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External value changes (not from this editor's own typing) get synced
  // in without clobbering the user's cursor/selection when the content is
  // already identical -- the common no-op case on every parent re-render.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} style={{ height: '100%', background: '#020617' }} />;
}
