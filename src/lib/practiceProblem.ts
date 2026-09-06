/**
 * The structured execution data behind a practice problem -- separate
 * from its MDX content on purpose. MDX stays purely the teaching material
 * (mission, worked intuition, solution writeup); this is the real,
 * structured data PracticePlayground.tsx actually executes against:
 * starter code, the function it calls, and real test cases (named-
 * argument input + expected output, never a hand-written call string or
 * an `assert` line parsed out of prose -- see pyodideWorker.ts's
 * toPythonLiteral() for how this becomes real Python source).
 *
 * Keyed by problem id, which is the same slug the route uses
 * (/practice/<id>) -- not every practice problem has an entry here yet;
 * only ones migrated to the new Playground engine do (see
 * PracticePlayground.tsx). Everything else still uses the older
 * RunnableCode `tests` string prop directly in its MDX, unchanged.
 */

export interface PracticeTestCase {
  id: string;
  label: string;
  input: Record<string, unknown>;
  expectedOutput: unknown;
}

/** Declares what a problem's execution actually needs, so the UI can say
 * so honestly if a capability isn't available rather than failing
 * mysteriously mid-run. Every problem migrated so far only needs plain
 * Python -- numpy/pytorch/gpu are real future capability tiers, not
 * implemented, not claimed. */
export interface RuntimeCapabilities {
  language: 'python';
  capabilities: Array<'python' | 'numpy' | 'pytorch' | 'gpu'>;
}

export interface PracticeProblem {
  id: string;
  functionName: string;
  starterCode: string;
  testCases: PracticeTestCase[];
  runtime: RuntimeCapabilities;
}

export const PRACTICE_PROBLEMS: Record<string, PracticeProblem> = {
  'dot-product': {
    id: 'dot-product',
    functionName: 'dot_product',
    starterCode: `def dot_product(a, b):
    """Return the dot product of two equal-length lists of numbers.
    Raise ValueError if len(a) != len(b)."""
    # Your implementation here
    pass
`,
    testCases: [
      { id: 'basic', label: 'Basic case', input: { a: [1, 2, 3], b: [4, 5, 6] }, expectedOutput: 32 },
      { id: 'zeros', label: 'Zero vector', input: { a: [0, 0], b: [5, 5] }, expectedOutput: 0 },
      { id: 'negatives', label: 'Negative values', input: { a: [-1, 2], b: [3, -4] }, expectedOutput: -11 },
      { id: 'single', label: 'Single element', input: { a: [2], b: [3] }, expectedOutput: 6 },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'matrix-multiplication': {
    id: 'matrix-multiplication',
    functionName: 'matmul',
    starterCode: `def matmul(A, B):
    """A, B: list of lists (rows). Return A @ B as a list of lists.
    Raise ValueError if A's row length != B's row count."""
    # Your implementation here
    pass
`,
    // Deliberately the second problem migrated to this engine specifically
    // because its shape is genuinely different from dot-product's (nested
    // list input AND nested list output, not scalars) -- this validates
    // toPythonLiteral()'s recursive array handling and the UI's JSON
    // display for a real 2D structure, not just a copy of the same shape.
    testCases: [
      { id: 'basic', label: '2x2 basic case', input: { A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]] }, expectedOutput: [[19, 22], [43, 50]] },
      { id: 'identity', label: 'Identity matrix', input: { A: [[1, 0], [0, 1]], B: [[9, 8], [7, 6]] }, expectedOutput: [[9, 8], [7, 6]] },
      { id: 'row-times-col', label: 'Row vector × column vector', input: { A: [[1, 2, 3]], B: [[1], [1], [1]] }, expectedOutput: [[6]] },
      { id: 'scalar', label: '1x1 matrices', input: { A: [[2]], B: [[3]] }, expectedOutput: [[6]] },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
};

export function getPracticeProblem(problemId: string): PracticeProblem | undefined {
  return PRACTICE_PROBLEMS[problemId];
}
