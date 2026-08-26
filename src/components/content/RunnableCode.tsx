import { useEffect, useRef, useState } from 'react';
import { useVizTokens, RADIUS, SPACING, FONT_FAMILY } from '../../theme/vizTokens';

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

type Status = 'idle' | 'loading' | 'running' | 'done';

/**
 * Real, in-browser Python execution -- Pyodide (CPython compiled to WASM),
 * loaded lazily from a CDN into a dedicated Worker on first Run click, not
 * on page load. Two modes:
 *
 * - No `tests` prop: plain "edit and run" -- real stdout, real tracebacks
 *   on error, nothing simulated.
 * - `tests` prop supplied (assert-based Python lines referencing whatever
 *   the learner's `code` defines): "implement this yourself" mode -- each
 *   assertion is run and reported pass/fail individually, not one
 *   all-or-nothing gate.
 *
 * Why a Worker at all: running CPython-in-WASM on the main thread would
 * freeze the page's UI for however long the script takes. Why "Stop"
 * terminates rather than interrupts: GitHub Pages cannot serve the
 * COOP/COEP headers Pyodide's SharedArrayBuffer-based interrupt buffer
 * needs, so a clean mid-script stop isn't available on this hosting --
 * terminate+respawn is the honest tradeoff, not a workaround pretending
 * to be the real thing.
 */
export default function RunnableCode({
  code: initialCode,
  tests,
  language = 'python',
}: {
  code: string;
  tests?: string;
  language?: 'python';
}) {
  const t = useVizTokens();
  void language; // reserved for a future non-Python runtime; Pyodide is Python-only today
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<Status>('idle');
  const [stdout, setStdout] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const nextIdRef = useRef(0);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  function ensureWorker(): Worker {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL('../../workers/pyodideWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    return worker;
  }

  function run() {
    setStatus(tests ? 'loading' : 'loading');
    setStdout('');
    setError(null);
    setTestResults(null);
    setLoadError(null);

    const worker = ensureWorker();
    const id = ++nextIdRef.current;

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.id !== id) return; // stale response from a prior (possibly terminated) run
      if (msg.type === 'load-error') {
        setLoadError(msg.loadErrorDetail ?? 'Failed to load the Python runtime.');
        setStatus('idle');
        return;
      }
      setStdout(msg.stdout ?? '');
      setError(msg.error ?? null);
      if (msg.testResults) setTestResults(msg.testResults);
      setStatus('done');
    };

    setStatus('running');
    if (tests) {
      worker.postMessage({ id, type: 'run-tests', code, tests });
    } else {
      worker.postMessage({ id, type: 'run', code });
    }
  }

  function stop() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setStatus('idle');
  }

  const isBusy = status === 'loading' || status === 'running';

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RADIUS.md, margin: `${SPACING.sm}px 0`, background: t.surfaceAlt, fontFamily: FONT_FAMILY, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${SPACING.xs}px ${SPACING.sm}px`, borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.accentTeal }}>
          {tests ? 'Implement it yourself' : 'Run it yourself'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {isBusy && (
            <button type="button" onClick={stop} style={btnStyle(t, 'secondary')}>
              Stop
            </button>
          )}
          <button type="button" onClick={run} disabled={isBusy} style={btnStyle(t, 'primary', isBusy)}>
            {status === 'loading' ? 'Loading Python…' : status === 'running' ? 'Running…' : 'Run'}
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={Math.min(Math.max(code.split('\n').length, 4), 20)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: SPACING.sm,
          background: t.surface,
          color: t.textPrimary,
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      />

      {tests && (
        <div style={{ padding: `0 ${SPACING.sm}px`, fontSize: 12, color: t.textSecondary, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap' }}>
          {tests}
        </div>
      )}

      {loadError && (
        <div style={{ padding: SPACING.sm, fontSize: 13, color: t.accentDanger }}>
          Couldn't load the in-browser Python runtime (needs network access to the CDN it loads from): {loadError}
        </div>
      )}

      {status === 'done' && !loadError && (
        <div style={{ padding: SPACING.sm, borderTop: `1px solid ${t.border}` }}>
          {stdout && (
            <pre style={{ margin: 0, marginBottom: error || testResults ? 8 : 0, fontSize: 12.5, color: t.textPrimary, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace' }}>
              {stdout}
            </pre>
          )}
          {error && (
            <pre style={{ margin: 0, fontSize: 12.5, color: t.accentDanger, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace' }}>
              {error}
            </pre>
          )}
          {testResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {testResults.map((r, i) => (
                <div key={i} style={{ fontSize: 12.5, color: r.passed ? t.accentPrimary : t.accentDanger, fontFamily: 'ui-monospace, monospace' }}>
                  {r.passed ? '✓' : '✗'} {r.name}
                  {!r.passed && <div style={{ paddingLeft: 16, color: t.textSecondary, whiteSpace: 'pre-wrap' }}>{r.detail}</div>}
                </div>
              ))}
              {testResults.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 12, color: t.textSecondary }}>
                  {testResults.filter((r) => r.passed).length} / {testResults.length} passed
                </div>
              )}
            </div>
          )}
          {!stdout && !error && !testResults && <div style={{ fontSize: 12.5, color: t.textSecondary }}>(no output)</div>}
        </div>
      )}
    </div>
  );
}

function btnStyle(t: ReturnType<typeof useVizTokens>, variant: 'primary' | 'secondary', disabled = false) {
  return {
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '5px 12px',
    borderRadius: RADIUS.sm,
    fontSize: 12.5,
    fontFamily: FONT_FAMILY,
    fontWeight: 600,
    border: `1px solid ${variant === 'primary' ? t.accentPrimary : t.border}`,
    background: variant === 'primary' ? t.accentPrimary : 'transparent',
    color: variant === 'primary' ? t.background : t.textPrimary,
    opacity: disabled ? 0.6 : 1,
  } as const;
}
