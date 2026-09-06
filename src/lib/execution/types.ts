import type { PracticeTestCase } from '../practiceProblem';

/** Every execution today is 'local' (Pyodide, in the learner's own
 * browser) -- there is no application server anywhere in this repo, and
 * this type exists specifically so that fact stays honestly labeled
 * everywhere a result is shown, rather than implied away. A future
 * 'server' executor (real server-side judging, genuinely hidden test
 * cases) can slot in without the UI changing at all -- see CodeExecutor
 * below -- but does not exist yet. Never call anything shipped to the
 * browser "hidden": every test case here is visible in the same bundle
 * the learner's code runs in. */
export type ExecutionMode = 'local' | 'server';

/** A real, distinct outcome for a Run/Submit -- never collapsed into a
 * single boolean. 'syntax_error' and 'runtime_error' are both real
 * Python exceptions, kept separate because they read very differently to
 * a learner (a syntax error means the code never ran at all). */
export type ExecutionStatus = 'success' | 'wrong_answer' | 'runtime_error' | 'syntax_error' | 'timeout';

export interface CaseExecutionResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: unknown;
  /** Raw Python traceback, present only when this specific case raised. */
  error: string | null;
  executionTimeMs?: number;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  mode: ExecutionMode;
  stdout: string;
  caseResults: CaseExecutionResult[];
  /** Learner-facing summary of what went wrong at the whole-run level
   * (e.g. the implementation itself failed to define the function) --
   * distinct from a single case's own `error`, which is scoped to that
   * one call. Null on success. */
  errorMessage: string | null;
  totalExecutionTimeMs?: number;
  usesLibrary?: boolean;
  bonusEarned?: boolean;
  bonusPoints?: number;
  bonusMessage?: string;
}


export interface ExecutionRequest {
  code: string;
  functionName: string;
  testCases: PracticeTestCase[];
}

/**
 * The one interface the Playground UI is allowed to depend on for running
 * code -- it must never import Pyodide, a Worker, or anything executor-
 * specific directly. This is what lets a real server-side executor exist
 * later (true hidden tests, sandboxed judging) as a second implementation
 * of this same interface, with zero changes to PracticePlayground.tsx.
 */
export interface CodeExecutor {
  readonly mode: ExecutionMode;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  /** Stops an in-flight execution. PyodideExecutor implements this as a
   * real Worker.terminate() + respawn (see its own docstring for why a
   * clean interrupt isn't available on this hosting) -- callers should
   * not assume partial results survive a terminate(). */
  terminate(): void;
}
