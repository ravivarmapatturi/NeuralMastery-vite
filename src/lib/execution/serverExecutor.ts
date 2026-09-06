import type { CodeExecutor, ExecutionRequest, ExecutionResult, CaseExecutionResult, ExecutionStatus } from './types';
import { PyodideExecutor } from './pyodideExecutor';

export interface ServerExecutorOptions {
  /** Target server execution API endpoint URL. Defaults to environment variable
   * VITE_SERVER_EXECUTOR_URL or local server http://localhost:3001/api/execute */
  endpointUrl?: string;
  /** Hard HTTP network timeout in milliseconds. Default 6000ms. */
  timeoutMs?: number;
  /** If true, automatically falls back to local PyodideExecutor when server is unreachable or errors out. Default true. */
  enableFallback?: boolean;
}

export class ServerExecutor implements CodeExecutor {
  readonly mode = 'server' as const;
  private endpointUrl: string;
  private timeoutMs: number;
  private enableFallback: boolean;
  private fallbackExecutor: PyodideExecutor | null = null;
  private activeController: AbortController | null = null;

  constructor(options: ServerExecutorOptions = {}) {
    const envUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SERVER_EXECUTOR_URL as string | undefined) : undefined;
    this.endpointUrl = options.endpointUrl || envUrl || 'http://localhost:3001/api/execute';
    this.timeoutMs = options.timeoutMs ?? 6000;
    this.enableFallback = options.enableFallback ?? true;
  }

  private getFallback(): PyodideExecutor {
    if (!this.fallbackExecutor) {
      this.fallbackExecutor = new PyodideExecutor();
    }
    return this.fallbackExecutor;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    this.activeController = new AbortController();
    const signal = this.activeController.signal;

    const timeoutId = setTimeout(() => {
      this.activeController?.abort();
    }, this.timeoutMs);

    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        status: ExecutionStatus;
        stdout: string;
        caseResults: CaseExecutionResult[];
        errorMessage: string | null;
        totalExecutionTimeMs?: number;
        truncated?: boolean;
      };

      return {
        status: data.status,
        mode: 'server',
        stdout: data.stdout ?? '',
        caseResults: data.caseResults ?? [],
        errorMessage: data.errorMessage ?? null,
        totalExecutionTimeMs: data.totalExecutionTimeMs ?? 0,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';

      if (this.enableFallback) {
        // Silent, graceful fallback to Pyodide in browser
        try {
          const fallbackResult = await this.getFallback().execute(request);
          const fallbackNotice = isAbort
            ? '[Server execution timed out — executed locally via Pyodide]'
            : `[Server unreachable (${err instanceof Error ? err.message : String(err)}) — executed locally via Pyodide]`;

          return {
            ...fallbackResult,
            stdout: fallbackResult.stdout ? `${fallbackNotice}\n${fallbackResult.stdout}` : fallbackNotice,
          };
        } catch (fallbackErr) {
          return {
            status: 'runtime_error',
            mode: 'local',
            stdout: '',
            caseResults: [],
            errorMessage: `Server unreachable (${isAbort ? 'Timeout' : (err as Error).message}) and local fallback unavailable: ${fallbackErr}`,
          };
        }
      }

      return {
        status: isAbort ? 'timeout' : 'runtime_error',
        mode: 'server',
        stdout: '',
        caseResults: [],
        errorMessage: isAbort
          ? `Server execution timed out after ${this.timeoutMs}ms.`
          : `Server execution error: ${err instanceof Error ? err.message : String(err)}`,
      };
    } finally {
      this.activeController = null;
    }
  }

  terminate(): void {
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
    if (this.fallbackExecutor) {
      this.fallbackExecutor.terminate();
    }
  }
}
