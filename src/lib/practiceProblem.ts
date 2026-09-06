/**
 * The structured execution and learning metadata behind practice problems --
 * separate from MDX content on purpose.
 */

export interface PracticeTestCase {
  id: string;
  label: string;
  input: Record<string, unknown>;
  expectedOutput?: unknown;
  expectError?: string;
  hidden?: boolean;
  description?: string;
}

export interface ConceptConnection {
  title: string;
  route: string;
  description: string;
}

export interface RuntimeCapabilities {
  language: 'python';
  capabilities: Array<'python' | 'numpy' | 'pytorch' | 'gpu'>;
}

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  estimatedTime: string;
  functionName: string;
  functionSignature: string;
  starterCode: string;
  mission: string;
  taskDescription: string;
  constraints: string[];
  testCases: PracticeTestCase[];
  libraryPolicyText?: string;
  bonusPoints?: number;
  bonusDescription?: string;
  hints?: {
    small: string;
    strong: string;
    concept: string;
  };
  conceptConnections?: ConceptConnection[];
  runtime: RuntimeCapabilities;
}

export const PRACTICE_PROBLEMS: Record<string, PracticeProblem> = {
  'dot-product': {
    id: 'dot-product',
    title: 'Dot Product From Scratch',
    difficulty: 'easy',
    topic: 'Linear Algebra',
    estimatedTime: '10–15 min',
    functionName: 'dot_product',
    functionSignature: 'dot_product(a: list[float], b: list[float]) -> float',
    starterCode: `def dot_product(a, b):
    """Return the dot product of two equal-length lists of numbers.
    Raise ValueError if len(a) != len(b)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the dot product from scratch, understand exactly what every multiplication and addition is doing, then connect the operation to the computations inside modern AI systems.',
    taskDescription: 'Implement `dot_product(a, b)` using plain Python or NumPy. Libraries are allowed, but implementing using Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python (no NumPy) earns +10 Bonus XP!',
      'Must raise ValueError if len(a) != len(b).',
      'Must handle floating-point values and negative numbers correctly.',
    ],
    hints: {
      small: 'Pair up corresponding elements from both vectors using zip(a, b) or an index loop.',
      strong: 'Check len(a) != len(b) first and raise ValueError("mismatched lengths"). Then return sum(x * y for x, y in zip(a, b)).',
      concept: 'The dot product computes a scalar sum of element-wise products: a · b = Σ (a_i * b_i). It measures direction alignment and is the fundamental operation in linear layers & attention scores.',
    },
    conceptConnections: [
      { title: 'Linear Algebra — Vectors', route: '/docs/mathematics-for-ai/linear-algebra#vectors', description: 'Vector spaces and geometric orientation' },
      { title: 'Attention & Transformers', route: '/docs/deep-learning/attention-transformers', description: 'Query-Key dot product similarity scoring' },
      { title: 'Word Embeddings & Cosine Similarity', route: '/docs/nlp/word-embeddings', description: 'Semantic vector alignment in high dimensions' },
    ],
    testCases: [
      { id: 'basic', label: 'Basic Case', input: { a: [1, 2, 3], b: [4, 5, 6] }, expectedOutput: 32, hidden: false, description: '1*4 + 2*5 + 3*6 = 32' },
      { id: 'zeros', label: 'Zero Vector', input: { a: [0, 0], b: [5, 5] }, expectedOutput: 0, hidden: false, description: 'Zero vector produces 0' },
      { id: 'negatives', label: 'Negative Values', input: { a: [-1, 2], b: [3, -4] }, expectedOutput: -11, hidden: false, description: '-1*3 + 2*-4 = -11' },
      { id: 'single', label: 'Single Element', input: { a: [2], b: [3] }, expectedOutput: 6, hidden: false, description: '2*3 = 6' },
      { id: 'mismatched', label: 'Dimension Mismatch', input: { a: [1, 2], b: [3] }, expectError: 'ValueError', hidden: true, description: 'Must raise ValueError when lengths differ' },
      { id: 'floats', label: 'Floating Point Numbers', input: { a: [0.5, 1.5], b: [2.0, 4.0] }, expectedOutput: 7.0, hidden: true, description: '0.5*2.0 + 1.5*4.0 = 7.0' },
      { id: 'larger', label: 'Larger Vector (Dim 5)', input: { a: [1, 2, 3, 4, 5], b: [5, 4, 3, 2, 1] }, expectedOutput: 35, hidden: true, description: '5 + 8 + 9 + 8 + 5 = 35' },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'matrix-multiplication': {
    id: 'matrix-multiplication',
    title: 'Matrix Multiplication From Scratch',
    difficulty: 'medium',
    topic: 'Linear Algebra',
    estimatedTime: '15–20 min',
    functionName: 'matmul',
    functionSignature: 'matmul(A: list[list[float]], B: list[list[float]]) -> list[list[float]]',
    starterCode: `def matmul(A, B):
    """A, B: list of lists (rows). Return A @ B as a list of lists.
    Raise ValueError if A's row length != B's row count."""
    # Your implementation here
    pass
`,
    mission: 'Implement 2D matrix multiplication using dot products of rows and columns, laying the foundation for dense neural network layers.',
    taskDescription: 'Implement `matmul(A, B)` for 2D matrices represented as nested lists. Raise `ValueError` if inner dimensions do not match.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +15 bonus XP',
    bonusPoints: 15,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python (no NumPy) earns +15 Bonus XP!',
      'Must check inner dimension compatibility (cols of A == rows of B).',
      'Return 2D list of numbers.',
    ],
    hints: {
      small: 'The element at result[i][j] is the dot product of A\'s i-th row and B\'s j-th column.',
      strong: 'Construct column j of B using [row[j] for row in B], then compute sum(a * b for a, b in zip(row_a, col_b)).',
      concept: 'Matrix multiplication combines linear transformations: (m x n) * (n x p) -> (m x p).',
    },
    testCases: [
      { id: 'basic', label: '2x2 basic case', input: { A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]] }, expectedOutput: [[19, 22], [43, 50]], hidden: false },
      { id: 'identity', label: 'Identity matrix', input: { A: [[1, 0], [0, 1]], B: [[9, 8], [7, 6]] }, expectedOutput: [[9, 8], [7, 6]], hidden: false },
      { id: 'row-times-col', label: 'Row vector × column vector', input: { A: [[1, 2, 3]], B: [[1], [1], [1]] }, expectedOutput: [[6]], hidden: false },
      { id: 'scalar', label: '1x1 matrices', input: { A: [[2]], B: [[3]] }, expectedOutput: [[6]], hidden: false },
      { id: 'mismatched', label: 'Dimension Mismatch', input: { A: [[1, 2, 3]], B: [[1, 2], [3, 4]] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
};

export function getPracticeProblem(problemId: string): PracticeProblem | undefined {
  const cleanId = problemId.replace(/\/$/, '');
  return PRACTICE_PROBLEMS[cleanId];
}
