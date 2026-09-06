import type { CodeExecutor, ExecutionRequest, ExecutionResult, ExecutionStatus, CaseExecutionResult } from './types';

interface WorkerCaseResult {
  id: string;
  passed: boolean;
  actualOutput: unknown;
  error: string | null;
  executionTimeMs?: number;
}


interface WorkerOutMessage {
  id: number;
  type: 'result' | 'load-error';
  stdout?: string;
  error?: string | null;
  caseResults?: WorkerCaseResult[];
  loadErrorDetail?: string;
}

export function isSyntaxError(traceback: string | null | undefined): boolean {
  return !!traceback && /SyntaxError|IndentationError/.test(traceback);
}

export function statusFor(caseResults: CaseExecutionResult[], setupError: string | null): ExecutionStatus {
  if (setupError) return isSyntaxError(setupError) ? 'syntax_error' : 'runtime_error';
  if (caseResults.length === 0) return 'runtime_error';
  if (caseResults.every((c) => c.passed)) return 'success';
  if (caseResults.some((c) => c.error)) return 'runtime_error';
  return 'wrong_answer';
}

/**
 * Real, in-browser Python execution via Pyodide (CPython-in-WASM), the
 * only CodeExecutor implementation that exists today -- see this repo's
 * README/CI_CD.md for why: GitHub Pages hosts static files only, there is
 * no application server anywhere in this project. `mode` is always
 * 'local' and this class never claims otherwise. A real server-side
 * executor (true hidden test cases, sandboxed judging) would implement
 * this exact same CodeExecutor interface -- PracticePlayground.tsx never
 * imports this class directly, only the interface, so that swap would be
 * additive, not a UI rewrite.
 *
 * Same Worker-per-instance, terminate-not-interrupt model RunnableCode.tsx
 * originally had inline -- moved here so it's independent of any specific
 * component and reusable by every problem the Playground engine covers,
 * not just one.
 */
export class PyodideExecutor implements CodeExecutor {
  readonly mode = 'local' as const;
  private worker: Worker | null = null;
  private nextId = 0;

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('../../workers/pyodideWorker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    return worker;
  }

  execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const worker = this.ensureWorker();
    const id = ++this.nextId;

    return new Promise((resolve) => {
      worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
        const msg = event.data;
        if (msg.id !== id) return; // stale response from a prior (possibly terminated) run

        if (msg.type === 'load-error') {
          resolve({
            status: 'runtime_error',
            mode: 'local',
            stdout: '',
            caseResults: [],
            errorMessage: msg.loadErrorDetail ?? "Couldn't load the in-browser Python runtime.",
          });
          return;
        }

        const caseResults: CaseExecutionResult[] = (msg.caseResults ?? []).map((c) => ({
          testCaseId: c.id,
          passed: c.passed,
          actualOutput: c.actualOutput,
          error: c.error,
          executionTimeMs: c.executionTimeMs,
        }));

        const totalExecutionTimeMs = caseResults.reduce((acc, c) => acc + (c.executionTimeMs ?? 0), 0);

        resolve({
          status: statusFor(caseResults, msg.error ?? null),
          mode: 'local',
          stdout: msg.stdout ?? '',
          caseResults,
          errorMessage: msg.error ?? null,
          totalExecutionTimeMs,
        });
      };

      worker.postMessage({
        id,
        type: 'run-cases',
        code: request.code,
        cases: request.testCases.map((tc) => ({
          id: tc.id,
          functionName: request.functionName,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          expectError: tc.expectError,
        })),
      });

    });
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
