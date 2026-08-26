/// <reference lib="webworker" />
// Runs in a dedicated module Worker (see RunnableCode.tsx, which spawns
// this via `new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
// type: 'module' })`). Loading Pyodide here, not on the main thread, is
// the whole point: CPython-in-WASM executing the user's code cannot then
// freeze the page's UI.
//
// One real constraint this design works around rather than ignores:
// GitHub Pages cannot serve the COOP/COEP response headers Pyodide's
// SharedArrayBuffer-based interrupt-buffer needs for a clean mid-script
// stop -- so there is no interrupt() call here. RunnableCode's "Stop"
// button instead calls worker.terminate() and spins up a fresh worker for
// the next run. That loses whatever the terminated run had in progress,
// which is the correct, honest tradeoff for this hosting, not a
// simplification of a "real" feature that was available.
//
// Pyodide is loaded from jsdelivr's CDN via dynamic import of its ESM
// build (pyodide.mjs) -- NOT importScripts(), which classic workers use
// but module workers (required here, since pyodide.asm.mjs is itself an
// ES module) do not support.
const PYODIDE_VERSION = 'v314.0.5';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

// Real, measured cold load is ~8.7MB / 17-22s (core wasm + stdlib + numpy),
// and a plain browser HTTP cache reload was NOT meaningfully faster in
// testing -- the cost is wasm compilation, not just the network fetch.
// Pyodide's own maintainers have said IndexedDB-based caching of *compiled*
// wasm modules is being removed from browsers (github.com/pyodide/pyodide
// discussion #4243), so that's not a real option. What Cache Storage DOES
// reliably do -- a stable, widely-supported API available in a dedicated
// Worker, not just Service Workers -- is skip the ~8.7MB *network* fetch on
// repeat visits by returning the exact same Response object the network
// gave us the first time (same headers/content-type intact, which matters:
// serving a reconstructed Response for a .wasm file can defeat the
// browser's own automatic wasm-compile caching). Patching `fetch` here,
// before Pyodide's loader code runs, catches its internal resource fetches
// (wasm/stdlib zip/wheels/lock file all go through plain fetch() once
// Pyodide's JS is executing in this patched scope) -- it does NOT catch the
// dynamic import() of pyodide.mjs itself (module loading bypasses fetch()
// overrides), but that file is 7KB, not the ~8.7MB that matters.
const PYODIDE_CACHE_NAME = `pyodide-runtime-${PYODIDE_VERSION}`;

async function installCachingFetch(): Promise<void> {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((k) => k.startsWith('pyodide-runtime-') && k !== PYODIDE_CACHE_NAME).map((k) => caches.delete(k)),
  );

  const cache = await caches.open(PYODIDE_CACHE_NAME);
  const nativeFetch = self.fetch.bind(self);
  self.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    if (request.method !== 'GET') return nativeFetch(request);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await nativeFetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  };
}

type RunMessage = { id: number; type: 'run'; code: string };
type RunTestsMessage = { id: number; type: 'run-tests'; code: string; tests: string };
type InMessage = RunMessage | RunTestsMessage;

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

interface OutMessage {
  id: number;
  type: 'ready' | 'result' | 'load-error';
  stdout?: string;
  error?: string | null;
  testResults?: TestResult[];
  loadErrorDetail?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded(): Promise<void> {
  if (pyodide) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      await installCachingFetch();
      // Dynamic import of a remote ESM URL -- valid in a dedicated module
      // worker (unlike a service worker, which forbids dynamic import()
      // and needs pyodide.asm.mjs passed in statically instead).
      const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`);
      pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    })();
  }
  await loadPromise;
}

// Wraps arbitrary user code so stdout is captured via io.StringIO instead
// of depending on a specific Pyodide JS-side stdout API -- plain stdlib
// behavior, stable across Pyodide versions.
const CAPTURE_PREAMBLE = `
import sys, io, traceback
_captured_stdout = io.StringIO()
_real_stdout = sys.stdout
sys.stdout = _captured_stdout
_run_error = None
try:
`;
const CAPTURE_POSTAMBLE = `
except Exception:
    _run_error = traceback.format_exc()
finally:
    sys.stdout = _real_stdout
`;

function indent(code: string): string {
  return code
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n');
}

self.onmessage = async (event: MessageEvent<InMessage>) => {
  const msg = event.data;
  try {
    await ensureLoaded();
  } catch (err) {
    const out: OutMessage = { id: msg.id, type: 'load-error', loadErrorDetail: String(err) };
    (self as unknown as Worker).postMessage(out);
    return;
  }

  if (msg.type === 'run') {
    // loadPyodide() only bundles core CPython -- packages like numpy are
    // separate, lazily-fetched wheels. loadPackagesFromImports scans the
    // code's `import` statements and fetches whatever's actually needed
    // (no-op, fast, if everything's already loaded from a prior run).
    await pyodide.loadPackagesFromImports(msg.code);
    const wrapped = CAPTURE_PREAMBLE + indent(msg.code) + CAPTURE_POSTAMBLE;
    await pyodide.runPythonAsync(wrapped);
    const stdout: string = pyodide.globals.get('_captured_stdout').getvalue();
    const error: string | null = pyodide.globals.get('_run_error');
    const out: OutMessage = { id: msg.id, type: 'result', stdout, error };
    (self as unknown as Worker).postMessage(out);
    return;
  }

  if (msg.type === 'run-tests') {
    // Run the learner's implementation first, then each test as its own
    // isolated `assert` so one failing test doesn't stop the rest from
    // reporting -- real pass/fail per case, not a single all-or-nothing gate.
    await pyodide.loadPackagesFromImports(msg.code);
    const setup = CAPTURE_PREAMBLE + indent(msg.code) + CAPTURE_POSTAMBLE;
    await pyodide.runPythonAsync(setup);
    const setupError: string | null = pyodide.globals.get('_run_error');

    const testResults: TestResult[] = [];
    if (!setupError) {
      const testCases = msg.tests
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('assert '));
      for (const testCase of testCases) {
        const testWrapped = CAPTURE_PREAMBLE + indent(testCase) + CAPTURE_POSTAMBLE;
        await pyodide.runPythonAsync(testWrapped);
        const testError: string | null = pyodide.globals.get('_run_error');
        testResults.push({ name: testCase, passed: !testError, detail: testError ?? 'passed' });
      }
    }

    const stdout: string = pyodide.globals.get('_captured_stdout').getvalue();
    const out: OutMessage = {
      id: msg.id,
      type: 'result',
      stdout,
      error: setupError,
      testResults: setupError ? [] : testResults,
    };
    (self as unknown as Worker).postMessage(out);
  }
};
