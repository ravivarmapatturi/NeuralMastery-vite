import { getPracticeProblems as getAllDocPracticeProblems } from './contentTree';

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
  /** Controls judging engine: 'local' (Pyodide in-browser), 'server' (Sandboxed server), or 'hybrid' (Server with Pyodide fallback) */
  judgeMode?: 'local' | 'server' | 'hybrid';
  prerequisite?: string | null;
  stage?: string;
  stageNumber?: number;
  points?: number;
}

export const PRACTICE_PROBLEMS: Record<string, PracticeProblem> = {
  'dot-product': {
    id: 'dot-product',
    title: 'Dot Product From Scratch',
    judgeMode: 'hybrid',
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
  'batch-dot-product': {
    id: 'batch-dot-product',
    judgeMode: 'hybrid',
    title: 'Batch Dot Product',
    difficulty: 'medium',
    topic: 'Linear Algebra',
    estimatedTime: '12–15 min',
    functionName: 'batch_dot_product',
    functionSignature: 'batch_dot_product(batch_a: list[list[float]], batch_b: list[list[float]]) -> list[float]',
    starterCode: `def batch_dot_product(batch_a, batch_b):
    """batch_a, batch_b: list of vectors (list of numbers), same length.
    Return a list of per-pair dot products.
    Raise ValueError on a batch-length or per-pair-dimension mismatch."""
    # Your implementation here
    pass
`,
    mission: 'Implement batch dot product across two batches of vectors, handling real validation for mismatched batch sizes and mismatched per-vector dimensions.',
    taskDescription: 'Implement `batch_dot_product(batch_a, batch_b)` using plain Python or NumPy. Libraries are allowed, but Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Raise ValueError if len(batch_a) != len(batch_b).',
      'Raise ValueError if any corresponding vector pair has len(a) != len(b).',
    ],
    hints: {
      small: 'Check len(batch_a) != len(batch_b) first. Iterate through zip(batch_a, batch_b) and validate vector lengths.',
      strong: 'For each pair (a, b), if len(a) != len(b) raise ValueError. Compute sum(x * y for x, y in zip(a, b)) and collect results.',
      concept: 'Batch dot product is the core building block of batched matrix operations in batched linear layers and attention scoring.',
    },
    conceptConnections: [
      { title: 'Linear Algebra — Vectors', route: '/docs/mathematics-for-ai/linear-algebra#vectors', description: 'Vector space arithmetic' },
      { title: 'Attention & Transformers', route: '/docs/deep-learning/attention-transformers', description: 'Batched query-key matrix multiplication' },
    ],
    testCases: [
      { id: 'basic', label: 'Basic Batch Case', input: { batch_a: [[1, 2, 3], [4, 5, 6]], batch_b: [[1, 0, 0], [0, 1, 0]] }, expectedOutput: [1, 5], hidden: false },
      { id: 'single-pair', label: 'Single Pair', input: { batch_a: [[1, 1]], batch_b: [[2, 3]] }, expectedOutput: [5], hidden: false },
      { id: 'empty', label: 'Empty Batches', input: { batch_a: [], batch_b: [] }, expectedOutput: [], hidden: false },
      { id: 'mismatched-batch', label: 'Mismatched Batch Count', input: { batch_a: [[1, 2]], batch_b: [] }, expectError: 'ValueError', hidden: true },
      { id: 'mismatched-dim', label: 'Mismatched Vector Dim', input: { batch_a: [[1, 2]], batch_b: [[1]] }, expectError: 'ValueError', hidden: true },
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
  'softmax': {
    id: 'softmax',
    title: 'Softmax Activation',
    difficulty: 'easy',
    topic: 'Neural Networks',
    estimatedTime: '10–15 min',
    functionName: 'softmax',
    functionSignature: 'softmax(logits: list[float]) -> list[float]',
    starterCode: `import math

def softmax(logits):
    """Return probability distribution over logits.
    Use numeric stabilization by subtracting max(logits)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the Softmax function with numerical stability trick to prevent overflow during exponentiation.',
    taskDescription: 'Implement `softmax(logits)` using standard Python or NumPy. Pure Python implementation earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy, PyTorch) are allowed.',
      'Pure Python earns +10 Bonus XP!',
      'Must handle numerical stability by subtracting max(logits) before exp().',
      'Return probability distribution summing to 1.0.',
    ],
    hints: {
      small: 'Subtract max(logits) from each logit before applying math.exp().',
      strong: 'm = max(logits); exps = [math.exp(x - m) for x in logits]; s = sum(exps); return [e / s for e in exps].',
      concept: 'Softmax turns raw logit scores into valid probabilities summing to 1.',
    },
    testCases: [
      { id: 'basic', label: 'Equal Logits', input: { logits: [1.0, 1.0, 1.0] }, expectedOutput: [1/3, 1/3, 1/3], hidden: false },
      { id: 'zeros', label: 'Zero Logits', input: { logits: [0.0, 0.0] }, expectedOutput: [0.5, 0.5], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'sigmoid-activation': {
    id: 'sigmoid-activation',
    title: 'Sigmoid Activation Function',
    difficulty: 'easy',
    topic: 'Neural Networks',
    estimatedTime: '10–15 min',
    functionName: 'sigmoid',
    functionSignature: 'sigmoid(x: float) -> float',
    starterCode: `import math

def sigmoid(x):
    """Return 1 / (1 + exp(-x))."""
    # Your implementation here
    pass
`,
    mission: 'Implement the Logistic Sigmoid activation function mapping real numbers into the range (0, 1).',
    taskDescription: 'Implement `sigmoid(x)` using standard Python or NumPy.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed.',
      'Pure Python earns +10 Bonus XP!',
      'Return float in range (0, 1).',
    ],
    hints: {
      small: 'Use 1 / (1 + math.exp(-x)).',
      strong: 'Check if x is very negative to prevent overflow in math.exp(-x).',
      concept: 'Sigmoid bounds linear output values to a binary probability range (0, 1).',
    },
    testCases: [
      { id: 'zero', label: 'Sigmoid of 0', input: { x: 0.0 }, expectedOutput: 0.5, hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'multi-head-attention': {
    id: 'multi-head-attention',
    judgeMode: 'hybrid',
    title: 'Multi-Head Self-Attention From Scratch',
    difficulty: 'hard',
    topic: 'Deep Learning',
    estimatedTime: '20–25 min',
    functionName: 'multi_head_attention',
    functionSignature: 'multi_head_attention(Q: np.ndarray, K: np.ndarray, V: np.ndarray, d_model: int, num_heads: int) -> np.ndarray',
    starterCode: `import numpy as np

def multi_head_attention(Q, K, V, d_model, num_heads):
    """
    Q, K, V: 2D arrays of shape (seq_len, d_model)
    d_model: total embedding dimension
    num_heads: number of attention heads
    Returns: output array of shape (seq_len, d_model)
    """
    # Your implementation here
    pass
`,
    mission: 'Implement multi-head self-attention projections, scaled dot-product attention, and head concatenation from scratch in pure NumPy.',
    taskDescription: 'Implement `multi_head_attention(Q, K, V, d_model, num_heads)`. Libraries (NumPy) are allowed!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'd_model must be evenly divisible by num_heads.',
      'Must compute scaled dot-product attention softmax(Q K^T / sqrt(d_k)) V per head.',
      'Output shape must strictly match (seq_len, d_model).',
    ],
    hints: {
      small: 'Reshape Q, K, V to (seq_len, num_heads, d_k) and swap axes to (num_heads, seq_len, d_k).',
      strong: 'Use np.matmul(Q_h, K_h.swapaxes(1, 2)) / np.sqrt(d_k), then apply softmax across axis=-1.',
      concept: 'Multi-head attention projects inputs into multiple subspaces, allowing the model to attend to different aspects of context simultaneously.',
    },
    testCases: [
      { id: 'shape', label: 'Output Shape Test', input: { Q: [[1.0, 0.0], [0.0, 1.0]], K: [[1.0, 0.0], [0.0, 1.0]], V: [[1.0, 2.0], [3.0, 4.0]], d_model: 2, num_heads: 1 }, expectedOutput: [[2.0, 3.0], [2.0, 3.0]], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'micro-autograd': {
    id: 'micro-autograd',
    judgeMode: 'hybrid',
    title: 'Micro-Autograd Computational Graph Engine',
    difficulty: 'hard',
    topic: 'Deep Learning',
    estimatedTime: '25–30 min',
    functionName: 'autograd_grad',
    functionSignature: 'autograd_grad(a_val: float, b_val: float) -> tuple[float, float]',
    starterCode: `def autograd_grad(a_val, b_val):
    """
    Build a computation graph for f(a, b) = (a * b) + (a * a)
    Return tuple (df/da, df/db) evaluated at a_val, b_val.
    """
    # Your implementation here
    pass
`,
    mission: 'Build automatic differentiation logic that tracks operations and executes reverse-mode backpropagation.',
    taskDescription: 'Implement `autograd_grad(a_val, b_val)` computing analytical gradients for $f(a, b) = a \cdot b + a^2$.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'df/da = b + 2a',
      'df/db = a',
    ],
    hints: {
      small: 'Use the multivariable calculus power rule and product rule: df/da = b + 2a.',
      strong: 'Evaluate df/da as b_val + 2 * a_val and df/db as a_val.',
      concept: 'Reverse-mode autograd propagates gradients backwards through the computation graph using the chain rule.',
    },
    testCases: [
      { id: 'basic', label: 'Evaluate at (2, 3)', input: { a_val: 2.0, b_val: 3.0 }, expectedOutput: [7.0, 2.0], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'adamw-optimizer': {
    id: 'adamw-optimizer',
    judgeMode: 'hybrid',
    title: 'AdamW Optimizer Step From Scratch',
    difficulty: 'medium',
    topic: 'Deep Learning',
    estimatedTime: '15–20 min',
    functionName: 'adamw_step',
    functionSignature: 'adamw_step(param: list, grad: list, m: list, v: list, t: int) -> tuple',
    starterCode: `def adamw_step(param, grad, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8, weight_decay=0.01):
    """
    Execute one AdamW update step.
    Return tuple (next_param, next_m, next_v) as lists.
    """
    # Your implementation here
    pass
`,
    mission: 'Implement AdamW adaptive learning rate optimization with decoupled weight decay.',
    taskDescription: 'Implement `adamw_step` computing first/second moments, bias corrections, and decoupled weight decay updates.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Must apply bias correction m_hat = m / (1 - beta1^t) and v_hat = v / (1 - beta2^t).',
      'Weight decay must be decoupled: param = param - lr * (m_hat / (sqrt(v_hat) + eps) + weight_decay * param).',
    ],
    hints: {
      small: 'Compute m_next = beta1 * m + (1 - beta1) * grad and v_next = beta2 * v + (1 - beta2) * (grad^2).',
      strong: 'Then divide by (1 - beta1**t) and (1 - beta2**t) before taking the param update step.',
      concept: 'AdamW separates weight decay from gradient updates, preserving adaptive learning rates across sparse or varied gradients.',
    },
    testCases: [
      { id: 't1', label: 'Step 1 Update', input: { param: [1.0], grad: [0.1], m: [0.0], v: [0.0], t: 1, lr: 0.1, weight_decay: 0.01 }, expectedOutput: [[0.899, 0.01, 0.0001]], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'react-agent-loop': {
    id: 'react-agent-loop',
    judgeMode: 'hybrid',
    title: 'ReAct Agent Execution Loop',
    difficulty: 'hard',
    topic: 'Agents & Applications',
    estimatedTime: '20–25 min',
    functionName: 'react_agent_step',
    functionSignature: 'react_agent_step(agent_output: str, available_tools: dict) -> dict',
    starterCode: `def react_agent_step(agent_output, available_tools):
    """
    Parses agent_output for Action: <name> and Action Input: <input>.
    Executes function from available_tools dict if present.
    Return dict {"status": "continue"|"finished"|"error", "observation": str, "final_answer": str|None}
    """
    # Your implementation here
    pass
`,
    mission: 'Build a ReAct parser and tool execution step engine that connects reasoning traces with real function invocation.',
    taskDescription: 'Implement `react_agent_step` parsing `Action:`, `Action Input:`, and `Final Answer:`.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'If "Final Answer:" is in agent_output, return status "finished".',
      'Otherwise parse Action and Action Input, call matching tool from available_tools, and return Observation string.',
    ],
    hints: {
      small: 'Use regex re.search(r"Action:\s*([^\n]+)", text) to extract action name.',
      strong: 'If action not in available_tools, return error status with description.',
      concept: 'ReAct loops alternate between reasoning and acting, allowing LLMs to interact dynamically with external tools.',
    },
    testCases: [
      { id: 'final', label: 'Final Answer Detection', input: { agent_output: 'Thought: I know the answer.\nFinal Answer: 42', available_tools: {} }, expectedOutput: { status: 'finished', final_answer: '42', observation: null }, hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'dpo-loss': {
    id: 'dpo-loss',
    judgeMode: 'hybrid',
    title: 'Direct Preference Optimization (DPO) Loss',
    difficulty: 'medium',
    topic: 'LLMs & GenAI',
    estimatedTime: '15–20 min',
    functionName: 'dpo_loss',
    functionSignature: 'dpo_loss(policy_chosen_logps: float, policy_rejected_logps: float, ref_chosen_logps: float, ref_rejected_logps: float, beta: float) -> float',
    starterCode: `def dpo_loss(policy_chosen_logps, policy_rejected_logps, ref_chosen_logps, ref_rejected_logps, beta=0.1):
    """
    Computes DPO loss for a single sample or batch.
    Return scalar loss float.
    """
    # Your implementation here
    pass
`,
    mission: 'Implement the Direct Preference Optimization (DPO) loss equation for aligning language models with human preferences.',
    taskDescription: 'Implement `dpo_loss` calculating $-\\log \\sigma (\\beta \\log \\frac{\\pi_\\theta(y_w)}{\\pi_{ref}(y_w)} - \\beta \\log \\frac{\\pi_\\theta(y_l)}{\\pi_{ref}(y_l)})$.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Must compute log-ratios pi_logratio = policy_chosen - policy_rejected and ref_logratio = ref_chosen - ref_rejected.',
      'logits = beta * (pi_logratio - ref_logratio).',
      'Return -log(sigmoid(logits)).',
    ],
    hints: {
      small: 'Compute logits = beta * ((policy_chosen - policy_rejected) - (ref_chosen - ref_rejected)).',
      strong: 'Use math.log(1 + math.exp(-logits)) for numerically stable -log(sigmoid(logits)).',
      concept: 'DPO aligns language models directly on human preference pairs without training an auxiliary reward model.',
    },
    testCases: [
      { id: 'zero_diff', label: 'Zero Preference Margin', input: { policy_chosen_logps: -1.0, policy_rejected_logps: -2.0, ref_chosen_logps: -1.0, ref_rejected_logps: -2.0, beta: 0.1 }, expectedOutput: 0.6931471805599453, hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'mcp-protocol-router': {
    id: 'mcp-protocol-router',
    judgeMode: 'hybrid',
    title: 'MCP Protocol JSON-RPC Tool Router',
    difficulty: 'medium',
    topic: 'Agents & Applications',
    estimatedTime: '15–20 min',
    functionName: 'mcp_router',
    functionSignature: 'mcp_router(jsonrpc_request: str, registered_tools: dict) -> str',
    starterCode: `import json

def mcp_router(jsonrpc_request, registered_tools):
    """
    Parses JSON-RPC 2.0 request string and handles tools/list or tools/call methods.
    Return JSON-RPC response string.
    """
    # Your implementation here
    pass
`,
    mission: 'Implement an MCP (Model Context Protocol) JSON-RPC 2.0 message handler for tool discovery and invocation.',
    taskDescription: 'Implement `mcp_router` supporting `tools/list` and `tools/call`.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Must return valid JSON-RPC 2.0 response matching {"jsonrpc": "2.0", "id": req_id, "result": ...}.',
      'Handle tools/list and tools/call methods.',
    ],
    hints: {
      small: 'Parse jsonrpc_request with json.loads. Extract id, method, and params.',
      strong: 'For tools/list, return {"tools": [...]}. For tools/call, execute registered function with arguments.',
      concept: 'MCP standardizes how AI agents discover and execute tools over structured JSON-RPC messaging.',
    },
    testCases: [
      { id: 'list_tools', label: 'Tools List Request', input: { jsonrpc_request: '{"jsonrpc":"2.0","id":1,"method":"tools/list"}', registered_tools: { 'calculator': { 'description': 'Performs math', 'schema': {} } } }, expectedOutput: '{"jsonrpc": "2.0", "id": 1, "result": {"tools": [{"name": "calculator", "description": "Performs math", "inputSchema": {}}]}}', hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'mcp-server-tool-handler': {
    id: 'mcp-server-tool-handler',
    judgeMode: 'hybrid',
    title: 'MCP Server Tool Handler',
    difficulty: 'medium',
    topic: 'Agents & Applications',
    estimatedTime: '15 min',
    functionName: 'handle_tool_call',
    functionSignature: 'handle_tool_call(tool_name: str, arguments: dict, registered_tools: dict) -> dict',
    starterCode: `def handle_tool_call(tool_name, arguments, registered_tools):
    """
    Executes registered MCP server tool and returns standard MCP content response dictionary.
    """
    # Your implementation here
    pass
`,
    mission: 'Implement an MCP Server tool execution handler with parameter validation and structured result output.',
    taskDescription: 'Implement `handle_tool_call` to execute registered functions and return standard MCP `{"content": [...], "isError": bool}` format.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Return {"content": [{"type": "text", "text": str(res)}], "isError": False} on success.',
      'Return {"content": [{"type": "text", "text": "error message"}], "isError": True} on missing parameters or exceptions.',
    ],
    hints: {
      small: 'Check if tool_name is in registered_tools. Verify required parameters.',
      strong: 'Invoke tool["function"](**arguments) and wrap output in content array.',
      concept: 'MCP Servers encapsulate tool execution logic safely and output standardized content responses.',
    },
    testCases: [
      { id: 'success_exec', label: 'Valid Execution', input: { tool_name: 'add', arguments: { 'a': 5, 'b': 3 }, registered_tools: { 'add': { 'required': ['a', 'b'], 'function': (a: number, b: number) => a + b } } }, expectedOutput: { content: [{ type: 'text', text: '8' }], isError: false }, hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'mcp-client-session': {
    id: 'mcp-client-session',
    judgeMode: 'hybrid',
    title: 'MCP Client Handshake & Initialization',
    difficulty: 'medium',
    topic: 'Agents & Applications',
    estimatedTime: '15 min',
    functionName: 'mcp_client_initialize',
    functionSignature: 'mcp_client_initialize(client_info: dict, protocol_version: str) -> str',
    starterCode: `import json

def mcp_client_initialize(client_info, protocol_version="2024-11-05"):
    """
    Constructs standard MCP initialize JSON-RPC request.
    """
    # Your implementation here
    pass
`,
    mission: 'Implement the MCP client handshake request generator for session initialization.',
    taskDescription: 'Implement `mcp_client_initialize` returning JSON-RPC 2.0 initialize request string.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Return valid JSON-RPC 2.0 payload with method "initialize".',
      'Include protocolVersion, clientInfo, and capabilities in params.',
    ],
    hints: {
      small: 'Construct a dictionary with jsonrpc "2.0", id 1, method "initialize", and params.',
      strong: 'Use json.dumps to format dictionary as JSON string.',
      concept: 'The initialize request negotiates protocol version and capabilities between MCP Client and Server.',
    },
    testCases: [
      { id: 'init_req', label: 'Initialize Payload', input: { client_info: { 'name': 'ClaudeDesktop', 'version': '1.0' }, protocol_version: '2024-11-05' }, expectedOutput: '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "ClaudeDesktop", "version": "1.0"}}}', hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'swish-activation': {
    id: 'swish-activation',
    judgeMode: 'hybrid',
    title: 'Swish Activation Function',
    difficulty: 'easy',
    topic: 'Deep Learning',
    estimatedTime: '10 min',
    functionName: 'swish',
    functionSignature: 'swish(x: list[float], beta: float = 1.0) -> list[float]',
    starterCode: `import math

def swish(x, beta=1.0):
    """
    Computes Swish activation element-wise: f(x) = x / (1 + exp(-beta * x)).
    """
    # Your implementation here
    pass
`,
    mission: 'Implement Swish activation f(x) = x * sigmoid(beta * x) widely used in EfficientNet and LLaMA architectures.',
    taskDescription: 'Implement `swish(x, beta=1.0)` returning a list of float activation values.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: ['Compute element-wise x / (1 + exp(-beta * x)).'],
    hints: {
      small: 'Apply x / (1 + exp(-beta * x)) for each element in list x.',
      strong: 'Use math.exp for calculating e^(-beta * x).',
      concept: 'Swish is a smooth, non-monotonic activation function discovered via neural architecture search.',
    },
    testCases: [
      { id: 't1', label: 'Zero & Positive Input', input: { x: [0.0, 1.0, 2.0], beta: 1.0 }, expectedOutput: [0.0, 0.7310585786300049, 1.7615941559557646], hidden: false },
      { id: 't2', label: 'Negative Values', input: { x: [-1.0, -2.0], beta: 1.0 }, expectedOutput: [-0.2689414213699951, -0.23840584404423515], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'selu-activation': {
    id: 'selu-activation',
    judgeMode: 'hybrid',
    title: 'SELU (Scaled Exponential Linear Unit)',
    difficulty: 'medium',
    topic: 'Deep Learning',
    estimatedTime: '12 min',
    functionName: 'selu',
    functionSignature: 'selu(x: list[float], scale: float, alpha: float) -> list[float]',
    starterCode: `import math

def selu(x, scale=1.0507009873554805, alpha=1.6732632423543772):
    """
    Computes SELU activation: scale * x if x > 0 else scale * alpha * (exp(x) - 1).
    """
    # Your implementation here
    pass
`,
    mission: 'Implement SELU activation function for self-normalizing neural networks.',
    taskDescription: 'Implement `selu(x)` returning element-wise scaled exponential linear activation values.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: ['If x > 0, return scale * x. Else return scale * alpha * (exp(x) - 1).'],
    hints: {
      small: 'Check condition for each element x in list.',
      strong: 'Use math.exp for calculating e^x.',
      concept: 'SELU enables self-normalizing neural networks where activations converge toward zero mean and unit variance.',
    },
    testCases: [
      { id: 't1', label: 'Positive and Zero', input: { x: [0.0, 1.0, 2.0] }, expectedOutput: [0.0, 1.0507009873554805, 2.101401974710961], hidden: false },
      { id: 't2', label: 'Negative Input', input: { x: [-1.0] }, expectedOutput: [-1.111330737812562], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'dropout-layer': {
    id: 'dropout-layer',
    judgeMode: 'hybrid',
    title: 'Inverted Dropout Layer',
    difficulty: 'medium',
    topic: 'Deep Learning',
    estimatedTime: '15 min',
    functionName: 'dropout',
    functionSignature: 'dropout(x: list[float], drop_prob: float, mask: list[int]) -> list[float]',
    starterCode: `def dropout(x, drop_prob, mask):
    """
    Applies inverted dropout using a binary mask (1 keep, 0 drop).
    Inverted dropout scales kept values by 1 / (1 - drop_prob).
    """
    # Your implementation here
    pass
`,
    mission: 'Implement Inverted Dropout where dropped elements are set to 0 and kept elements are scaled by 1 / (1 - p).',
    taskDescription: 'Implement `dropout(x, drop_prob, mask)` returning scaled activation list.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: ['Multiply kept values by 1 / (1 - drop_prob). Set dropped values to 0.0.'],
    hints: {
      small: 'Scale kept values by 1.0 / (1.0 - drop_prob).',
      strong: 'Multiply x[i] * mask[i] * scale.',
      concept: 'Inverted dropout preserves activation magnitude during training so inference requires zero modification.',
    },
    testCases: [
      { id: 't1', label: 'Dropout p=0.5', input: { x: [2.0, 4.0, 6.0, 8.0], drop_prob: 0.5, mask: [1, 0, 1, 0] }, expectedOutput: [4.0, 0.0, 12.0, 0.0], hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'k-nearest-neighbors': {
    id: 'k-nearest-neighbors',
    judgeMode: 'hybrid',
    title: 'K-Nearest Neighbors (KNN) Classifier',
    difficulty: 'medium',
    topic: 'Machine Learning',
    estimatedTime: '15 min',
    functionName: 'knn_predict',
    functionSignature: 'knn_predict(X_train: list[list[float]], y_train: list[int], x_test: list[float], k: int) -> int',
    starterCode: `import math
from collections import Counter

def knn_predict(X_train, y_train, x_test, k):
    """
    Predicts majority class for x_test based on k nearest neighbors by Euclidean distance.
    """
    # Your implementation here
    pass
`,
    mission: 'Implement K-Nearest Neighbors classifier by computing Euclidean distances to training samples.',
    taskDescription: 'Implement `knn_predict(X_train, y_train, x_test, k)` returning predicted integer class label.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: ['Compute Euclidean distance for each training sample. Select top k nearest labels.'],
    hints: {
      small: 'Compute sqrt(sum((a - b)^2)). Sort distances ascending.',
      strong: 'Use Counter(k_labels).most_common(1)[0][0] to pick majority label.',
      concept: 'KNN is a non-parametric instance-based algorithm that classifies data points based on spatial proximity.',
    },
    testCases: [
      { id: 't1', label: '2D Classification k=3', input: { X_train: [[0,0], [0,1], [1,0], [5,5], [5,6]], y_train: [0, 0, 0, 1, 1], x_test: [0.5, 0.5], k: 3 }, expectedOutput: 0, hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'bellman-value-iteration': {
    id: 'bellman-value-iteration',
    judgeMode: 'hybrid',
    title: 'Bellman Equation for Value Iteration',
    difficulty: 'medium',
    topic: 'Reinforcement Learning',
    estimatedTime: '15 min',
    functionName: 'bellman_update',
    functionSignature: 'bellman_update(state: int, transitions: dict, V: list[float], gamma: float) -> float',
    starterCode: `def bellman_update(state, transitions, V, gamma):
    """
    Computes updated V(s) = max_a sum_{s'} P(s'|s,a) * [ R(s,a,s') + gamma * V(s') ].
    """
    # Your implementation here
    pass
`,
    mission: 'Implement state value update V*(s) = max_a sum_{s\'} P(s\'|s,a)[R + gamma * V(s\')].',
    taskDescription: 'Implement `bellman_update(state, transitions, V, gamma)` returning updated float state value.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: ['For each action, sum probability * (reward + gamma * V[next_s]). Return maximum over actions.'],
    hints: {
      small: 'Loop over actions in transitions[state]. Calculate expected return.',
      strong: 'Return max(action_values).',
      concept: 'Value Iteration applies the Bellman Optimality Operator iteratively until state values converge.',
    },
    testCases: [
      { id: 't1', label: '2 Action MDP', input: { state: 0, transitions: { 0: { 'a1': [[0.8, 1, 10.0], [0.2, 0, 0.0]], 'a2': [[1.0, 0, 2.0]] } }, V: [0.0, 50.0], gamma: 0.9 }, expectedOutput: 44.0, hidden: false },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'vec-search-prob-1': {
    id: 'vec-search-prob-1',
    title: 'Euclidean Distance Between Vectors',
    difficulty: 'easy',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '10–15 min',
    functionName: 'euclidean_distance',
    functionSignature: 'euclidean_distance(a: list[float], b: list[float]) -> float',
    starterCode: `import math

def euclidean_distance(a, b):
    """Return the Euclidean (L2) distance between two equal-length vectors.
    Raise ValueError if len(a) != len(b)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the Euclidean distance metric that flat (brute-force) vector indexes and FAISS/pgvector\'s L2 index type use to rank candidate vectors against a query embedding.',
    taskDescription: 'Implement `euclidean_distance(a, b)` returning sqrt(sum((a_i - b_i)^2)). Libraries (NumPy) are allowed, but Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Must raise ValueError if len(a) != len(b).',
      'Must return a non-negative float.',
    ],
    hints: {
      small: 'Subtract corresponding elements, square each difference, sum them, then take the square root.',
      strong: 'Check len(a) != len(b) first and raise ValueError. Then return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b))).',
      concept: 'Euclidean distance is the straight-line distance between two points in vector space -- the default metric for flat (brute-force) vector indexes and the L2 index type in FAISS/pgvector.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'How vector indexes rank candidates by distance metric' },
    ],
    testCases: [
      { id: 'basic', label: 'Basic 3-4-5 Case', input: { a: [0, 0], b: [3, 4] }, expectedOutput: 5.0, hidden: false, description: 'sqrt(3^2 + 4^2) = 5' },
      { id: 'identical', label: 'Identical Vectors', input: { a: [1, 2, 3], b: [1, 2, 3] }, expectedOutput: 0.0, hidden: false, description: 'Distance to self is 0' },
      { id: 'negatives', label: 'Negative Coordinates', input: { a: [-1, -1], b: [2, 3] }, expectedOutput: 5.0, hidden: true, description: 'sqrt(3^2 + 4^2) = 5' },
      { id: 'floats', label: 'Floating Point Vectors', input: { a: [1.5, 2.5], b: [0.0, 0.0] }, expectedOutput: 2.9154759474226504, hidden: true },
      { id: 'mismatched', label: 'Dimension Mismatch', input: { a: [1, 2], b: [1] }, expectError: 'ValueError', hidden: true, description: 'Must raise ValueError when lengths differ' },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-2': {
    id: 'vec-search-prob-2',
    title: 'Manhattan Distance Between Vectors',
    difficulty: 'easy',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '10–15 min',
    functionName: 'manhattan_distance',
    functionSignature: 'manhattan_distance(a: list[float], b: list[float]) -> float',
    starterCode: `def manhattan_distance(a, b):
    """Return the Manhattan (L1) distance between two equal-length vectors.
    Raise ValueError if len(a) != len(b)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the Manhattan (L1) distance metric, the axis-aligned alternative to Euclidean distance that some vector indexes expose for sparse or grid-like embeddings.',
    taskDescription: 'Implement `manhattan_distance(a, b)` returning sum(|a_i - b_i|). Libraries (NumPy) are allowed, but Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Must raise ValueError if len(a) != len(b).',
      'Must return a non-negative float or int.',
    ],
    hints: {
      small: 'Take the absolute difference of each corresponding pair of elements, then sum them.',
      strong: 'Check len(a) != len(b) first and raise ValueError. Then return sum(abs(x - y) for x, y in zip(a, b)).',
      concept: 'Manhattan distance sums absolute per-axis differences instead of squaring them -- it is less sensitive to a single large-magnitude axis than Euclidean distance.',
    },
    testCases: [
      { id: 'basic', label: 'Basic Case', input: { a: [0, 0], b: [3, 4] }, expectedOutput: 7, hidden: false, description: '|3| + |4| = 7' },
      { id: 'mixed', label: 'Mixed Differences', input: { a: [1, 2, 3], b: [4, 0, 3] }, expectedOutput: 5, hidden: false, description: '3 + 2 + 0 = 5' },
      { id: 'negatives', label: 'Negative Coordinates', input: { a: [-1, -1], b: [2, 3] }, expectedOutput: 7, hidden: true, description: '3 + 4 = 7' },
      { id: 'floats', label: 'Floating Point Vectors', input: { a: [2.5, 1.5], b: [0, 0] }, expectedOutput: 4.0, hidden: true },
      { id: 'mismatched', label: 'Dimension Mismatch', input: { a: [1, 2], b: [1] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-3': {
    id: 'vec-search-prob-3',
    title: 'Cosine Similarity Between Vectors',
    difficulty: 'easy',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '10–15 min',
    functionName: 'cosine_similarity',
    functionSignature: 'cosine_similarity(a: list[float], b: list[float]) -> float',
    starterCode: `import math

def cosine_similarity(a, b):
    """Return the cosine similarity between two equal-length vectors, in [-1, 1].
    Raise ValueError if len(a) != len(b), or if either vector has zero magnitude."""
    # Your implementation here
    pass
`,
    mission: 'Implement cosine similarity, the default relevance metric embedding-based semantic search and RAG retrieval use because it measures directional alignment, ignoring magnitude.',
    taskDescription: 'Implement `cosine_similarity(a, b)` returning (a . b) / (||a|| * ||b||). Libraries (NumPy) are allowed, but Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Must raise ValueError if len(a) != len(b).',
      'Must raise ValueError if either vector has zero magnitude (undefined direction).',
    ],
    hints: {
      small: 'Compute the dot product, then divide by the product of the two vector magnitudes.',
      strong: 'dot = sum(x*y for x, y in zip(a, b)); na = sqrt(sum(x*x for x in a)); nb = sqrt(sum(y*y for y in b)). Raise ValueError if na == 0 or nb == 0, else return dot / (na * nb).',
      concept: 'Cosine similarity is scale-invariant: scaling a vector by any positive constant does not change its cosine similarity to another vector, only Euclidean distance would change.',
    },
    conceptConnections: [
      { title: 'Retrieval-Augmented Generation (RAG)', route: '/docs/llms-genai/rag', description: 'Cosine similarity ranks retrieved chunks against a query embedding' },
      { title: 'Word Embeddings', route: '/docs/nlp/word-embeddings', description: 'Semantic vector alignment in high dimensions' },
    ],
    testCases: [
      { id: 'orthogonal', label: 'Orthogonal Vectors', input: { a: [1, 0], b: [0, 1] }, expectedOutput: 0.0, hidden: false, description: 'Perpendicular vectors have similarity 0' },
      { id: 'identical', label: 'Identical Direction', input: { a: [1, 1], b: [1, 1] }, expectedOutput: 1.0, hidden: false },
      { id: 'opposite', label: 'Opposite Direction', input: { a: [1, 0], b: [-1, 0] }, expectedOutput: -1.0, hidden: false },
      { id: 'scale-invariant', label: 'Scale Invariance', input: { a: [3, 4], b: [6, 8] }, expectedOutput: 1.0, hidden: true, description: 'Same direction regardless of magnitude' },
      { id: 'zero-vector', label: 'Zero-Magnitude Vector', input: { a: [0, 0], b: [1, 1] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-4': {
    id: 'vec-search-prob-4',
    title: 'Normalize a Vector to Unit Length',
    difficulty: 'easy',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '10–15 min',
    functionName: 'normalize_vector',
    functionSignature: 'normalize_vector(v: list[float]) -> list[float]',
    starterCode: `import math

def normalize_vector(v):
    """Return v scaled to unit (L2) length.
    Raise ValueError if v is the zero vector."""
    # Your implementation here
    pass
`,
    mission: 'Implement L2 normalization, the preprocessing step embedding-based vector indexes apply so that an inner-product (dot-product) search behaves identically to a cosine-similarity search.',
    taskDescription: 'Implement `normalize_vector(v)` returning [x / ||v|| for x in v]. Libraries (NumPy) are allowed, but Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Must raise ValueError if v is the zero vector.',
      'The returned vector must have L2 norm 1.0 (within floating-point tolerance).',
    ],
    hints: {
      small: 'Compute the L2 norm (magnitude) of v first, then divide every element by it.',
      strong: 'n = math.sqrt(sum(x*x for x in v)). Raise ValueError if n == 0. Otherwise return [x / n for x in v].',
      concept: 'Once every vector in an index is L2-normalized, dot(a, b) == cosine_similarity(a, b) -- many ANN libraries (e.g. FAISS IndexFlatIP) rely on this to turn cosine search into a cheaper inner-product search.',
    },
    testCases: [
      { id: 'basic', label: 'Basic 3-4-5 Vector', input: { v: [3, 4] }, expectedOutput: [0.6, 0.8], hidden: false, description: 'Magnitude 5 -> [3/5, 4/5]' },
      { id: 'already-unit', label: 'Already Unit Vector', input: { v: [1, 0, 0] }, expectedOutput: [1.0, 0.0, 0.0], hidden: false },
      { id: 'equal-components', label: 'Equal Components', input: { v: [2, 2, 2, 2] }, expectedOutput: [0.5, 0.5, 0.5, 0.5], hidden: true },
      { id: 'single-element', label: 'Single Element', input: { v: [5] }, expectedOutput: [1.0], hidden: true },
      { id: 'zero-vector', label: 'Zero Vector', input: { v: [0, 0, 0] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-5': {
    id: 'vec-search-prob-5',
    title: 'Vector Magnitude (L2 Norm)',
    difficulty: 'easy',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '10–15 min',
    functionName: 'vector_magnitude',
    functionSignature: 'vector_magnitude(v: list[float]) -> float',
    starterCode: `import math

def vector_magnitude(v):
    """Return the L2 norm (Euclidean length) of v."""
    # Your implementation here
    pass
`,
    mission: 'Implement the L2 norm computation that underlies normalization, cosine similarity, and Euclidean distance -- the single most reused primitive in a vector search stack.',
    taskDescription: 'Implement `vector_magnitude(v)` returning sqrt(sum(x_i^2)). Libraries (NumPy) are allowed, but Pure Python earns +10 Bonus XP!',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Must return a non-negative float.',
      'The zero vector has magnitude 0.0 (not an error).',
    ],
    hints: {
      small: 'Square every element, sum the squares, then take the square root of the total.',
      strong: 'return math.sqrt(sum(x * x for x in v)).',
      concept: 'Vector magnitude (L2 norm) measures a vector\'s length independent of direction -- it is the denominator in both cosine similarity and L2 normalization.',
    },
    testCases: [
      { id: 'basic', label: 'Basic 3-4-5 Case', input: { v: [3, 4] }, expectedOutput: 5.0, hidden: false },
      { id: 'ones', label: 'Ones Vector', input: { v: [1, 1, 1, 1] }, expectedOutput: 2.0, hidden: false, description: 'sqrt(4) = 2' },
      { id: 'zero', label: 'Zero Vector', input: { v: [0, 0, 0] }, expectedOutput: 0.0, hidden: true },
      { id: 'negatives', label: 'Negative Components', input: { v: [-6, 8] }, expectedOutput: 10.0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-6': {
    id: 'vec-search-prob-6',
    title: 'Brute-Force K-Nearest-Neighbor Search',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'brute_force_knn',
    functionSignature: 'brute_force_knn(query: list[float], vectors: list[list[float]], k: int) -> list[int]',
    starterCode: `import math

def brute_force_knn(query, vectors, k):
    """Return the indices (into vectors) of the k vectors closest to query
    by Euclidean distance, ordered nearest-first. Ties broken by index
    ascending. Raise ValueError if k <= 0 or k > len(vectors)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the exact ("flat") k-NN search every ANN index (HNSW, IVF, LSH) is an approximation of -- the ground-truth baseline used to measure the recall of every faster index structure.',
    taskDescription: 'Implement `brute_force_knn(query, vectors, k)`: compute the Euclidean distance from `query` to every row in `vectors`, and return the indices of the k nearest, sorted nearest-first (ties broken by ascending index).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Raise ValueError if k <= 0 or k > len(vectors).',
      'Ties in distance must be broken by ascending original index.',
    ],
    hints: {
      small: 'Compute the Euclidean distance from query to every vector, then sort by (distance, index) and take the first k indices.',
      strong: 'dists = [(euclidean_distance(query, v), i) for i, v in enumerate(vectors)]; dists.sort(); return [i for _, i in dists[:k]] -- sorting tuples already breaks ties by the second element (index) since Python compares tuples lexicographically.',
      concept: 'Brute-force k-NN is O(n*d) per query -- exact but too slow at scale, which is exactly why approximate structures like HNSW and IVF trade a small amount of recall for sub-linear query time.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'Exact k-NN is the recall baseline every ANN index is measured against' },
    ],
    testCases: [
      { id: 'basic', label: 'k=3 Nearest', input: { query: [0, 0], vectors: [[0, 0], [1, 0], [5, 5], [0.5, 0.5], [10, 10]], k: 3 }, expectedOutput: [0, 3, 1], hidden: false },
      { id: 'k2', label: 'k=2 Nearest', input: { query: [0, 0], vectors: [[1, 1], [2, 2], [3, 3], [10, 10]], k: 2 }, expectedOutput: [0, 1], hidden: false },
      { id: 'tie-break', label: 'Tied Distances', input: { query: [1, 1], vectors: [[1, 1], [1, 1], [5, 5]], k: 2 }, expectedOutput: [0, 1], hidden: true, description: 'Two vectors at distance 0 -- resolved by ascending index' },
      { id: 'k-too-large', label: 'k Exceeds Vector Count', input: { query: [0, 0], vectors: [[1, 1]], k: 5 }, expectError: 'ValueError', hidden: true },
      { id: 'k-zero', label: 'k is Zero', input: { query: [0, 0], vectors: [[1, 1], [2, 2]], k: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-7': {
    id: 'vec-search-prob-7',
    title: 'Build an Inverted Index',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'build_inverted_index',
    functionSignature: 'build_inverted_index(documents: list[list[str]]) -> dict[str, list[int]]',
    starterCode: `def build_inverted_index(documents):
    """documents: a list of tokenized documents (each a list of string tokens).
    Return a dict mapping each unique token to the sorted list of document
    indices that contain it (each index appears at most once per token,
    even if the token repeats within a document)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the inverted index -- the classic sparse-retrieval data structure (used by BM25, Elasticsearch, and hybrid search systems) that every dense vector index is typically paired with in production RAG.',
    taskDescription: 'Implement `build_inverted_index(documents)`: for every unique token across all documents, list every document index (deduplicated, ascending) in which it appears.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (standard library only -- collections, etc.) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Each document index must appear at most once per token, even if the token repeats within that document.',
      'Document indices for each token must be sorted ascending.',
      'An empty `documents` list, or documents with no tokens, should produce an empty dict for terms that never occur.',
    ],
    hints: {
      small: 'For each document, get its unique tokens first (e.g. with set()), then record that document\'s index under each of those tokens.',
      strong: 'index = {}; for doc_id, tokens in enumerate(documents): for term in set(tokens): index.setdefault(term, []).append(doc_id). Sort each list before returning.',
      concept: 'An inverted index flips a term-per-document view into a document-list-per-term view -- turning "which words are in doc 5?" into an O(1) lookup for "which docs contain \'transformer\'?", the core operation behind keyword/BM25 search.',
    },
    conceptConnections: [
      { title: 'Retrieval & Reranking Architectures', route: '/docs/llms-genai/retrieval-and-reranking-architectures', description: 'Sparse (inverted-index/BM25) retrieval as a hybrid-search component alongside dense vector search' },
    ],
    testCases: [
      { id: 'basic', label: 'Three Short Documents', input: { documents: [['the', 'cat', 'sat'], ['the', 'dog', 'ran'], ['cat', 'and', 'dog']] }, expectedOutput: { the: [0, 1], cat: [0, 2], sat: [0], dog: [1, 2], ran: [1], and: [2] }, hidden: false },
      { id: 'dedup-within-doc', label: 'Repeated Token in One Document', input: { documents: [['a', 'a', 'b'], ['b', 'c']] }, expectedOutput: { a: [0], b: [0, 1], c: [1] }, hidden: false, description: 'Repeating "a" in doc 0 still yields a single entry [0]' },
      { id: 'empty-doc', label: 'Single Empty Document', input: { documents: [[]] }, expectedOutput: {}, hidden: true },
      { id: 'single-doc', label: 'Single Document', input: { documents: [['x', 'y']] }, expectedOutput: { x: [0], y: [0] }, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'vec-search-prob-8': {
    id: 'vec-search-prob-8',
    title: 'Pairwise Cosine Similarity Matrix',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'cosine_similarity_matrix',
    functionSignature: 'cosine_similarity_matrix(vectors: list[list[float]]) -> list[list[float]]',
    starterCode: `import math

def cosine_similarity_matrix(vectors):
    """Return the n x n matrix of pairwise cosine similarities between the
    n vectors in 'vectors' (matrix[i][j] = cosine similarity of vectors[i]
    and vectors[j]; the diagonal is always 1.0). Raise ValueError if any
    vector has zero magnitude."""
    # Your implementation here
    pass
`,
    mission: 'Implement the pairwise similarity matrix used to build the candidate graph for graph-based ANN indexes (like HNSW) and for offline semantic deduplication of an embedding collection.',
    taskDescription: 'Implement `cosine_similarity_matrix(vectors)`, returning an n x n matrix where entry [i][j] is the cosine similarity between vectors[i] and vectors[j].',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'The diagonal of the returned matrix must be exactly 1.0.',
      'The matrix must be symmetric: matrix[i][j] == matrix[j][i].',
      'Raise ValueError if any input vector has zero magnitude.',
    ],
    hints: {
      small: 'Loop over every pair (i, j) of vectors and compute their cosine similarity, storing it at matrix[i][j].',
      strong: 'For i == j, the similarity with itself is always 1.0 -- skip the (redundant) computation there. Reuse a cosine_similarity(a, b) helper for i != j.',
      concept: 'This matrix is exactly what graph-based ANN indexes like HNSW build (approximately, via greedy search) to decide which nodes to connect -- and what an offline "find near-duplicate embeddings" pass would scan directly.',
    },
    testCases: [
      { id: 'basic', label: '3 Vectors (2D)', input: { vectors: [[1, 0], [0, 1], [1, 1]] }, expectedOutput: [[1.0, 0.0, 0.7071067811865475], [0.0, 1.0, 0.7071067811865475], [0.7071067811865475, 0.7071067811865475, 1.0]], hidden: false },
      { id: 'parallel', label: 'Parallel Vectors (Different Magnitude)', input: { vectors: [[1, 0], [2, 0]] }, expectedOutput: [[1.0, 1.0], [1.0, 1.0]], hidden: false, description: 'Cosine similarity is scale-invariant' },
      { id: 'single', label: 'Single Vector', input: { vectors: [[3, 4]] }, expectedOutput: [[1.0]], hidden: true },
      { id: 'zero-vector', label: 'Zero-Magnitude Vector Present', input: { vectors: [[1, 0], [0, 0]] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-9': {
    id: 'vec-search-prob-9',
    title: 'Scalar Quantize a Vector',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'scalar_quantize',
    functionSignature: 'scalar_quantize(vector: list[float], num_bits: int) -> list[int]',
    starterCode: `def scalar_quantize(vector, num_bits):
    """Uniformly quantize each element of 'vector' to an integer code in
    [0, 2**num_bits - 1] using min-max scalar quantization. Raise
    ValueError if num_bits <= 0. If every element is identical (a zero
    range), return all-zero codes instead of dividing by zero."""
    # Your implementation here
    pass
`,
    mission: 'Implement scalar quantization, the memory-compression technique real vector databases (Qdrant, Milvus, FAISS\'s ScalarQuantizer) use to shrink float32 embeddings down to 8-bit (or fewer) integer codes so billions of vectors fit in RAM.',
    taskDescription: 'Implement `scalar_quantize(vector, num_bits)`: map each float in `vector` linearly from [min(vector), max(vector)] onto integer codes in [0, 2**num_bits - 1], rounding to the nearest code.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Raise ValueError if num_bits <= 0.',
      'Each returned code must be an integer in [0, 2**num_bits - 1] inclusive.',
      'If min(vector) == max(vector) (zero range), return a list of all zeros instead of dividing by zero.',
    ],
    hints: {
      small: 'Find lo = min(vector) and hi = max(vector). Each code is (x - lo) / (hi - lo) scaled up to the number of available levels, then rounded.',
      strong: 'levels = 2**num_bits - 1; if hi == lo: return [0]*len(vector); return [round((x - lo) / (hi - lo) * levels) for x in vector].',
      concept: 'Scalar quantization trades a small amount of precision (a handful of bits per dimension) for a 4x-32x memory reduction -- the same lo/hi range must be stored alongside the codes so a query vector can be quantized/compared the same way at search time.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'Quantization is how production vector indexes fit billions of embeddings in memory' },
    ],
    testCases: [
      { id: 'basic-8bit', label: '8-bit Quantization', input: { vector: [0.0, 0.25, 1.0], num_bits: 8 }, expectedOutput: [0, 64, 255], hidden: false, description: '0.25 of the [0,1] range maps to round(0.25 * 255) = 64' },
      { id: 'negatives-2bit', label: '2-bit Quantization With Negatives', input: { vector: [-1.0, -0.2, 1.0], num_bits: 2 }, expectedOutput: [0, 1, 3], hidden: false },
      { id: 'constant', label: 'Constant Vector (Zero Range)', input: { vector: [5, 5, 5], num_bits: 4 }, expectedOutput: [0, 0, 0], hidden: true },
      { id: '1bit', label: '1-bit Quantization', input: { vector: [0, 10], num_bits: 1 }, expectedOutput: [0, 1], hidden: true },
      { id: 'invalid-bits', label: 'Invalid num_bits', input: { vector: [1, 2, 3], num_bits: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'vec-search-prob-10': {
    id: 'vec-search-prob-10',
    title: 'Reciprocal Rank Fusion',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'reciprocal_rank_fusion',
    functionSignature: 'reciprocal_rank_fusion(rankings: list[list[int]], k: int = 60) -> list[int]',
    starterCode: `def reciprocal_rank_fusion(rankings, k=60):
    """rankings: a list of ranked result lists (each a list of document
    IDs, best-first, 1-indexed rank = position + 1). Return a single
    fused ranking (list of document IDs) sorted by descending combined
    RRF score = sum over lists containing the doc of 1 / (k + rank).
    Ties broken by ascending document ID."""
    # Your implementation here
    pass
`,
    mission: 'Implement Reciprocal Rank Fusion (RRF), the standard technique production hybrid-search systems use to merge a dense vector-search ranking with a sparse BM25/keyword-search ranking into one final ranking.',
    taskDescription: 'Implement `reciprocal_rank_fusion(rankings, k=60)`: for every document, sum 1/(k + rank) across every input ranking it appears in (rank is 1-indexed), then return document IDs sorted by descending total score, ties broken by ascending ID.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (standard library only) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Rank is 1-indexed: the first element of each ranking list has rank 1.',
      'A document missing from a given ranking contributes 0 from that ranking.',
      'Ties in total score must be broken by ascending document ID.',
      '`k` defaults to 60, the conventional RRF constant from the original paper.',
    ],
    hints: {
      small: 'Give every document a running score. For each input ranking, walk it in order and add 1/(k + rank) to that document\'s score.',
      strong: 'scores = {}; for ranking in rankings: for rank, doc_id in enumerate(ranking, start=1): scores[doc_id] = scores.get(doc_id, 0.0) + 1.0/(k+rank). Then return sorted(scores, key=lambda d: (-scores[d], d)).',
      concept: 'RRF only needs rank positions, not raw similarity scores or BM25 scores -- which is exactly why it works to combine two rankings from completely different scoring scales (cosine similarity vs. BM25) without any score normalization step.',
    },
    conceptConnections: [
      { title: 'Retrieval & Reranking Architectures', route: '/docs/llms-genai/retrieval-and-reranking-architectures', description: 'RRF is the standard way to fuse dense and sparse retrieval rankings in hybrid search' },
    ],
    testCases: [
      { id: 'default-k', label: 'Default k, Overlapping Lists', input: { rankings: [[1, 2, 3], [2, 1, 4]] }, expectedOutput: [1, 2, 3, 4], hidden: false, description: 'Docs 1 and 2 rank highest in both lists' },
      { id: 'small-k-ties', label: 'Small k, No Overlap (Ties)', input: { rankings: [[1, 2], [3, 4]], k: 1 }, expectedOutput: [1, 3, 2, 4], hidden: false, description: 'Rank-1 docs (1 and 3) tie and are ordered by ascending ID' },
      { id: 'single-list', label: 'Single Ranking Passthrough', input: { rankings: [[10, 20, 30]], k: 60 }, expectedOutput: [10, 20, 30], hidden: true, description: 'Fusing one list preserves its order' },
      { id: 'symmetric-swap', label: 'Two Lists in Reversed Order', input: { rankings: [[5, 6, 7], [7, 6, 5]], k: 60 }, expectedOutput: [5, 7, 6], hidden: true, description: 'Docs 5 and 7 tie (rank 1 in one list, rank 3 in the other) and are ordered by ascending ID; doc 6 (rank 2 in both) scores strictly lower' },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'vec-search-prob-11': {
    id: 'vec-search-prob-11',
    title: 'Radius (Range) Query Over Vectors',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'range_query',
    functionSignature: 'range_query(query: list[float], vectors: list[list[float]], radius: float) -> list[int]',
    starterCode: `import math

def range_query(query, vectors, radius):
    """Return the indices (into vectors) of every vector within Euclidean
    distance <= radius of query, ordered nearest-first (ties broken by
    ascending index). Return an empty list if none qualify."""
    # Your implementation here
    pass
`,
    mission: 'Implement radius (range) search, the "find everything within distance r" query mode vector databases expose alongside top-k search -- used for near-duplicate detection and density-based clustering (e.g. DBSCAN).',
    taskDescription: 'Implement `range_query(query, vectors, radius)`: return the indices of every vector whose Euclidean distance to `query` is <= radius, sorted nearest-first.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'A vector at distance exactly equal to radius must be included.',
      'Results must be ordered by ascending distance, ties broken by ascending index.',
      'Return an empty list if no vector is within radius.',
    ],
    hints: {
      small: 'Compute the distance from query to every vector, keep only the ones within radius, then sort the survivors by distance.',
      strong: 'candidates = [(euclidean_distance(query, v), i) for i, v in enumerate(vectors) if euclidean_distance(query, v) <= radius]; candidates.sort(); return [i for _, i in candidates].',
      concept: 'Unlike top-k search (always returns exactly k results), radius search returns a variable-size result set -- the query itself defines "relevant," not a fixed count, which is why it is the query mode DBSCAN-style clustering relies on.',
    },
    testCases: [
      { id: 'basic', label: 'Radius 1.5', input: { query: [0, 0], vectors: [[0, 0], [1, 0], [2, 0], [5, 5]], radius: 1.5 }, expectedOutput: [0, 1], hidden: false },
      { id: 'small-radius', label: 'Tight Radius', input: { query: [0, 0], vectors: [[0, 0], [1, 0], [2, 0], [5, 5]], radius: 0.5 }, expectedOutput: [0], hidden: false },
      { id: 'large-radius', label: 'Radius Covers Everything', input: { query: [0, 0], vectors: [[0, 0], [1, 0], [2, 0], [5, 5]], radius: 100 }, expectedOutput: [0, 1, 2, 3], hidden: true },
      { id: 'none-in-range', label: 'Nothing Within Radius', input: { query: [100, 100], vectors: [[0, 0], [1, 0]], radius: 1 }, expectedOutput: [], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'vec-search-prob-12': {
    id: 'vec-search-prob-12',
    title: 'Deduplicate Near-Duplicate Embeddings',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    functionName: 'deduplicate_near_duplicates',
    functionSignature: 'deduplicate_near_duplicates(vectors: list[list[float]], threshold: float) -> list[int]',
    starterCode: `import math

def deduplicate_near_duplicates(vectors, threshold):
    """Process vectors in order. Keep a vector's index unless its cosine
    similarity to some already-kept vector is >= threshold, in which case
    treat it as a near-duplicate and skip it. Return the kept indices in
    their original order."""
    # Your implementation here
    pass
`,
    mission: 'Implement semantic near-duplicate removal, the offline index-optimization pass real embedding pipelines run before indexing to keep a vector database from wasting memory (and search recall) on redundant near-identical chunks.',
    taskDescription: 'Implement `deduplicate_near_duplicates(vectors, threshold)`: walk `vectors` in order, keeping the index of any vector whose cosine similarity to every already-kept vector is below `threshold`; skip it otherwise.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'Process vectors in their original order; a later vector is compared only against already-kept earlier vectors, never against ones already skipped.',
      'A vector is a duplicate if its cosine similarity to ANY already-kept vector is >= threshold (not just the most recent one).',
      'Return kept indices in their original relative order.',
    ],
    hints: {
      small: 'Keep a running list of indices you have decided to keep. For each new vector, compare it against every already-kept vector using cosine similarity.',
      strong: 'kept = []; for i, v in enumerate(vectors): if not any(cosine_similarity(v, vectors[j]) >= threshold for j in kept): kept.append(i). Return kept.',
      concept: 'This is a greedy O(n^2) dedup pass -- production systems approximate it at scale with locality-sensitive hashing (LSH) or by querying the index-so-far for near neighbors instead of comparing against every kept vector directly.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'Near-duplicate removal keeps an index compact and improves retrieval diversity' },
    ],
    testCases: [
      { id: 'basic', label: 'Two Near-Duplicate Pairs', input: { vectors: [[1, 0], [1, 0.01], [0, 1], [0.99, 0.02]], threshold: 0.999 }, expectedOutput: [0, 2], hidden: false, description: 'Vectors 1 and 3 are near-duplicates of vector 0' },
      { id: 'loose-threshold', label: 'Loose Threshold Keeps All', input: { vectors: [[1, 0], [0, 1], [-1, 0]], threshold: 0.5 }, expectedOutput: [0, 1, 2], hidden: false, description: 'No pair reaches 0.5 cosine similarity' },
      { id: 'all-duplicates', label: 'All Identical Vectors', input: { vectors: [[1, 0], [1, 0], [1, 0]], threshold: 0.999 }, expectedOutput: [0], hidden: true },
      { id: 'strict-threshold', label: 'Threshold of Exactly 1.0', input: { vectors: [[1, 0], [1, 0]], threshold: 1.0 }, expectedOutput: [0], hidden: true, description: 'Identical vectors have cosine similarity exactly 1.0, which meets the >= 1.0 threshold' },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'class-ml-prob-1': {
    id: 'class-ml-prob-1',
    title: 'Precision, Recall & F1 From a Confusion Matrix',
    difficulty: 'easy',
    topic: 'Classical Machine Learning',
    estimatedTime: '10–15 min',
    functionName: 'precision_recall_f1',
    functionSignature: 'precision_recall_f1(tp: int, fp: int, fn: int) -> dict',
    starterCode: `def precision_recall_f1(tp, fp, fn):
    """tp, fp, fn: true positive / false positive / false negative counts
    for the positive class. Return {'precision': ..., 'recall': ...,
    'f1': ...}. Define precision = 0.0 if tp+fp == 0, recall = 0.0 if
    tp+fn == 0, and f1 = 0.0 if precision+recall == 0, instead of
    dividing by zero."""
    # Your implementation here
    pass
`,
    mission: 'Implement the three classification metrics that matter far more than raw accuracy whenever classes are imbalanced -- the numbers behind every "high accuracy, useless model" cautionary tale in ML.',
    taskDescription: "Implement `precision_recall_f1(tp, fp, fn)`, returning a dict with keys 'precision', 'recall', and 'f1', computed from the standard formulas with explicit zero-division guards.",
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (standard library only) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'precision = tp / (tp + fp), or 0.0 if tp + fp == 0.',
      'recall = tp / (tp + fn), or 0.0 if tp + fn == 0.',
      'f1 = 2 * precision * recall / (precision + recall), or 0.0 if precision + recall == 0.',
    ],
    hints: {
      small: 'Precision asks "of everything I predicted positive, how much was right?" Recall asks "of everything actually positive, how much did I catch?"',
      strong: "Guard each division separately: `precision = tp/(tp+fp) if (tp+fp) > 0 else 0.0`, same pattern for recall, then f1 from precision and recall.",
      concept: 'F1 is the harmonic mean of precision and recall specifically because the harmonic mean punishes a large imbalance between the two far more than an arithmetic mean would -- a model with precision=1.0 and recall=0.01 gets an arithmetic mean of ~0.5 but an F1 of ~0.02, which is the far more honest summary of a nearly-useless model.',
    },
    conceptConnections: [
      { title: 'Model Evaluation & Metrics', route: '/docs/machine-learning/model-evaluation-metrics', description: 'Precision, recall, and F1 as the standard classification metrics beyond raw accuracy' },
    ],
    testCases: [
      { id: 'typical-case', label: 'Typical Confusion Matrix', input: { tp: 50, fp: 10, fn: 5 }, expectedOutput: { precision: 0.8333333333333334, recall: 0.9090909090909091, f1: 0.8695652173913043 }, hidden: false },
      { id: 'no-predictions', label: 'No Positive Predictions At All', input: { tp: 0, fp: 0, fn: 5 }, expectedOutput: { precision: 0.0, recall: 0.0, f1: 0.0 }, hidden: false, description: 'tp+fp == 0 -- precision is defined as 0.0, not undefined' },
      { id: 'no-actual-positives', label: 'No Actual Positives Missed or Found', input: { tp: 0, fp: 5, fn: 0 }, expectedOutput: { precision: 0.0, recall: 0.0, f1: 0.0 }, hidden: true, description: 'tp+fn == 0 -- recall is defined as 0.0' },
      { id: 'perfect-classifier', label: 'Perfect Classifier', input: { tp: 20, fp: 0, fn: 0 }, expectedOutput: { precision: 1.0, recall: 1.0, f1: 1.0 }, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-2': {
    id: 'class-ml-prob-2',
    title: 'L1/L2 Regularization Effect on a Loss Function',
    difficulty: 'easy',
    topic: 'Classical Machine Learning',
    estimatedTime: '10–15 min',
    functionName: 'regularized_loss',
    functionSignature: 'regularized_loss(mse: float, weights: list[float], l1: float = 0.0, l2: float = 0.0) -> float',
    starterCode: `def regularized_loss(mse, weights, l1=0.0, l2=0.0):
    """mse: the model's unregularized data loss (already computed).
    weights: the model's weight vector (bias/intercept excluded). l1, l2:
    regularization strengths. Return mse + l1 * sum(|w|) + l2 * sum(w^2)
    -- an elastic-net-style combined penalty (either term alone recovers
    plain Lasso or plain Ridge)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the actual arithmetic Ridge (L2), Lasso (L1), and Elastic Net regularization add on top of a base loss -- the concrete mechanism behind "regularization shrinks weights," made computational rather than conceptual.',
    taskDescription: 'Implement `regularized_loss(mse, weights, l1=0.0, l2=0.0)`, returning `mse + l1 * sum(abs(w) for w in weights) + l2 * sum(w**2 for w in weights)`.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (standard library only) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'The intercept/bias term is never regularized -- only pass the non-bias weights in.',
      'l1=0.0 (the default) recovers plain Ridge behavior; l2=0.0 recovers plain Lasso behavior; both nonzero is Elastic Net.',
      'l1 and l2 both default to 0.0, so calling with just `mse` and `weights` returns the unregularized mse unchanged.',
    ],
    hints: {
      small: 'The L1 penalty is a strength times the sum of absolute weight values; the L2 penalty is a strength times the sum of squared weight values.',
      strong: 'return mse + l1 * sum(abs(w) for w in weights) + l2 * sum(w * w for w in weights).',
      concept: 'L1\'s penalty is proportional to |w| (constant gradient magnitude regardless of how large w already is), which is why Lasso can drive weights to EXACTLY zero (real feature selection); L2\'s penalty is proportional to w^2 (gradient shrinks as w approaches zero), which shrinks weights smoothly toward zero but essentially never all the way to it.',
    },
    conceptConnections: [
      { title: 'Ridge Regression, In Full Depth', route: '/docs/machine-learning/ridge-regression', description: 'The L2 penalty term this problem adds to a base loss' },
      { title: 'Lasso Regression, In Full Depth', route: '/docs/machine-learning/lasso-regression', description: 'The L1 penalty term this problem adds to a base loss' },
    ],
    testCases: [
      { id: 'l1-only', label: 'L1 (Lasso) Only', input: { mse: 2.0, weights: [1.0, -2.0, 3.0], l1: 0.1, l2: 0.0 }, expectedOutput: 2.6, hidden: false, description: '0.1 * (1 + 2 + 3) = 0.6 added to the base loss' },
      { id: 'l2-only', label: 'L2 (Ridge) Only', input: { mse: 2.0, weights: [1.0, -2.0, 3.0], l1: 0.0, l2: 0.1 }, expectedOutput: 3.4, hidden: false, description: '0.1 * (1 + 4 + 9) = 1.4 added to the base loss' },
      { id: 'zero-weights', label: 'Zero Weights (No Penalty Regardless of Strength)', input: { mse: 1.5, weights: [0.0, 0.0], l1: 0.5, l2: 0.5 }, expectedOutput: 1.5, hidden: true },
      { id: 'defaults', label: 'Default l1/l2 (Unregularized)', input: { mse: 4.2, weights: [10.0, -10.0] }, expectedOutput: 4.2, hidden: true, description: 'Omitting l1/l2 falls back to their 0.0 defaults' },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-3': {
    id: 'class-ml-prob-3',
    title: 'Ensemble Majority-Vote Classifier',
    difficulty: 'easy',
    topic: 'Classical Machine Learning',
    estimatedTime: '10–15 min',
    functionName: 'majority_vote',
    functionSignature: 'majority_vote(predictions: list[list[int]]) -> list[int]',
    starterCode: `def majority_vote(predictions):
    """predictions: a list of M models' predictions, each a list of the
    same N class-label predictions (one per sample) -- predictions[m][s]
    is model m's prediction for sample s. Return one list of N labels:
    for each sample, the class label that received the most votes across
    the M models. Break ties by the smaller class label."""
    # Your implementation here
    pass
`,
    mission: 'Implement hard-voting ensemble aggregation -- the combination step that turns M independently-trained models (a bagging ensemble, a random forest\'s individual trees, or just M different classifiers) into one prediction per sample.',
    taskDescription: 'Implement `majority_vote(predictions)`: for each sample (each column across the M prediction lists), tally how many models predicted each class label, and return the label with the most votes -- ties broken by the smaller label.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (standard library only) are allowed and accepted normally.',
      'Pure Python earns +10 Bonus XP!',
      'predictions is M lists of N predictions each (M models, N samples); predictions[m][s] is model m\'s vote for sample s.',
      'Return exactly N labels, one per sample.',
      'On a tie (multiple labels with the same top vote count for a sample), return the smallest tied label.',
    ],
    hints: {
      small: 'For each sample index, collect that sample\'s prediction from every model, then find the most common one.',
      strong: 'For sample s: votes = {}; for m in range(M): votes[predictions[m][s]] = votes.get(predictions[m][s], 0) + 1. Then pick the label with the max count, breaking ties by iterating candidate labels in sorted order and keeping the first one that reaches the max count.',
      concept: 'Hard voting (majority of predicted labels) is what "bagging" ensembles like Random Forest use at prediction time -- each tree/model votes independently, and the ensemble\'s real advantage comes from the fact that uncorrelated individual errors tend to cancel out in the vote, not from any single model being better.',
    },
    conceptConnections: [
      { title: 'Random Forest & Extra Trees, In Full Depth', route: '/docs/machine-learning/random-forest', description: 'Majority voting as the aggregation step every bagging ensemble uses at prediction time' },
    ],
    testCases: [
      { id: 'clear-majority', label: 'Clear Majority Per Sample', input: { predictions: [[0, 1, 1], [1, 1, 0], [1, 1, 1]] }, expectedOutput: [1, 1, 1], hidden: false, description: 'Every sample has a 2-out-of-3 (or 3-out-of-3) majority' },
      { id: 'two-model-tie', label: 'A Tied Sample (2 Models)', input: { predictions: [[0, 1], [0, 0]] }, expectedOutput: [0, 0], hidden: false, description: 'Sample 1 is a 1-1 tie between labels 0 and 1 -- resolved to the smaller label, 0' },
      { id: 'five-models', label: 'Five Models, Three Samples', input: { predictions: [[2, 0, 1], [2, 1, 1], [0, 0, 1], [2, 0, 0], [2, 1, 1]] }, expectedOutput: [2, 0, 1], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-11': {
    id: 'class-ml-prob-11',
    title: 'Linear Regression via the Normal Equation',
    difficulty: 'medium',
    topic: 'Classical Machine Learning',
    estimatedTime: '15–20 min',
    functionName: 'linear_regression_normal_equation',
    functionSignature: 'linear_regression_normal_equation(X: list[list[float]], y: list[float]) -> list[float]',
    starterCode: `import numpy as np

def linear_regression_normal_equation(X, y):
    """X: list of feature rows (no bias column). y: list of targets.
    Return the fitted weight vector [intercept, w1, w2, ...] solving
    ordinary least squares via the closed-form normal equation
    w = (X^T X)^-1 X^T y, after prepending a column of ones to X."""
    # Your implementation here
    pass
`,
    mission: 'Implement the closed-form (normal equation) solution to ordinary least squares -- the exact solution gradient descent only approximates iteratively, and the textbook baseline every regularized variant (Ridge, Lasso) is a variation of.',
    taskDescription: 'Implement `linear_regression_normal_equation(X, y)`: prepend a column of ones to X (for the intercept), then return w = (X_aug^T X_aug)^-1 X_aug^T y as a plain Python list, ordered [intercept, w1, w2, ...].',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python (manual Gauss-Jordan matrix inversion) implementation',
    constraints: [
      'NumPy is allowed and recommended (np.linalg.inv or np.linalg.solve) -- the test matrices are small, but a pure-Python Gauss-Jordan inversion also works and earns the bonus.',
      'The returned list\'s first element is the intercept (bias term); the rest are the per-feature weights in the same order as X\'s columns.',
      'Assume X^T X is invertible (X has more rows than columns and no perfectly collinear features).',
    ],
    hints: {
      small: 'Prepend a column of 1s to X first -- that column\'s learned weight becomes the intercept.',
      strong: 'X_aug = np.hstack([np.ones((len(X), 1)), np.array(X)]); w = np.linalg.inv(X_aug.T @ X_aug) @ X_aug.T @ np.array(y); return w.tolist().',
      concept: 'The normal equation comes from setting the gradient of the least-squares cost (1/2)||Xw - y||^2 to zero and solving directly -- no learning rate, no iterations, exact in one shot (at the cost of an O(d^3) matrix inversion, which is why gradient descent wins for very high-dimensional X).',
    },
    conceptConnections: [
      { title: 'Linear Regression, In Full Depth', route: '/docs/machine-learning/linear-regression', description: 'The normal equation as the closed-form alternative to gradient descent' },
    ],
    testCases: [
      { id: 'exact-1d-fit', label: 'Exact 1D Fit (y = 2x + 1)', input: { X: [[1], [2], [3], [4]], y: [3, 5, 7, 9] }, expectedOutput: [1.0, 2.0], hidden: false, description: 'Noise-free data recovers the exact generating weights' },
      { id: 'constant-target', label: 'Constant Target', input: { X: [[0], [1], [2]], y: [1, 1, 1] }, expectedOutput: [1.0, 0.0], hidden: false, description: 'A flat target fits intercept = mean(y), slope = 0' },
      { id: 'exact-2d-fit', label: 'Exact 2D Fit', input: { X: [[1, 1], [2, 1], [3, 2], [4, 3]], y: [4, 7, 9, 11] }, expectedOutput: [2.0, 3.0, -1.0], hidden: true, description: 'Data generated from w = [2, 3, -1] is recovered exactly' },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'class-ml-prob-12': {
    id: 'class-ml-prob-12',
    title: 'Logistic Regression: Forward Pass + Log Loss',
    difficulty: 'medium',
    topic: 'Classical Machine Learning',
    estimatedTime: '15–20 min',
    functionName: 'logistic_regression_loss',
    functionSignature: 'logistic_regression_loss(X: list[list[float]], y: list[int], weights: list[float], bias: float) -> float',
    starterCode: `import math

def logistic_regression_loss(X, y, weights, bias):
    """X: list of feature rows. y: list of 0/1 labels. weights, bias:
    model parameters. Return the mean binary cross-entropy (log) loss
    over the dataset: for each row, z = dot(x, weights) + bias, p =
    sigmoid(z), loss_i = -(y*log(p) + (1-y)*log(1-p)). Clip p to
    [1e-15, 1-1e-15] before taking a log, to avoid log(0)."""
    # Your implementation here
    pass
`,
    mission: 'Implement logistic regression\'s full forward pass and cost function -- the actual thing being minimized during training, distinct from just the sigmoid function itself.',
    taskDescription: 'Implement `logistic_regression_loss(X, y, weights, bias)`: for every row, compute z = w.x + b, squash it with sigmoid, then average the binary cross-entropy loss -(y*log(p) + (1-y)*log(1-p)) across all rows.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy) are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Clip p into [1e-15, 1 - 1e-15] before calling log(), so a perfectly confident (and wrong) prediction never produces log(0).',
      'Return the MEAN loss across all rows, not the sum.',
    ],
    hints: {
      small: 'This is dot_product + sigmoid + the binary cross-entropy formula, chained together per row, then averaged.',
      strong: 'z = sum(w*x for w, x in zip(weights, xi)) + bias; p = 1/(1+math.exp(-z)); p = min(max(p, 1e-15), 1-1e-15); loss_i = -(yi*math.log(p) + (1-yi)*math.log(1-p)).',
      concept: 'Binary cross-entropy is the negative log-likelihood of the true label under the model\'s predicted probability -- it heavily penalizes confident-but-wrong predictions (as p -> 0 for a true label of 1, -log(p) -> infinity), which is exactly why it (not MSE) is the loss classification models train against.',
    },
    conceptConnections: [
      { title: 'Logistic Regression, In Full Depth', route: '/docs/machine-learning/logistic-regression', description: 'The sigmoid + binary cross-entropy pipeline this problem implements end to end' },
    ],
    testCases: [
      { id: 'zero-logit', label: 'Zero Logit (Maximum Uncertainty)', input: { X: [[0.0]], y: [1], weights: [0.0], bias: 0.0 }, expectedOutput: 0.6931471805599453, hidden: false, description: 'z=0 gives p=0.5; loss = -ln(0.5) = ln(2)' },
      { id: 'symmetric-pair', label: 'Symmetric Confident Pair', input: { X: [[2.0], [-2.0]], y: [1, 0], weights: [1.0], bias: 0.0 }, expectedOutput: 0.12692801104297258, hidden: false, description: 'Both rows are equally (and correctly) confident by symmetry' },
      { id: 'three-row-batch', label: 'Three-Row Batch, 2 Features', input: { X: [[1.0, 2.0], [2.0, 1.0], [-1.0, -2.0]], y: [1, 1, 0], weights: [0.5, 0.5], bias: 0.0 }, expectedOutput: 0.20141327798275248, hidden: true, description: 'All three rows land at the same |z|=1.5 by construction' },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-13': {
    id: 'class-ml-prob-13',
    title: 'Decision Tree Split Quality: Gini & Information Gain',
    difficulty: 'medium',
    topic: 'Classical Machine Learning',
    estimatedTime: '15–20 min',
    functionName: 'information_gain',
    functionSignature: "information_gain(parent: list, left: list, right: list, criterion: str = 'gini') -> float",
    starterCode: `import math

def information_gain(parent, left, right, criterion='gini'):
    """parent: class labels at a node before splitting. left, right: the
    class labels that land in each child after a candidate split.
    criterion: 'gini' (Gini impurity) or 'entropy' (Shannon entropy, log
    base 2). Return impurity(parent) minus the size-weighted average
    impurity of the two children. Raise ValueError for any other
    criterion."""
    # Your implementation here
    pass
`,
    mission: 'Implement the exact split-quality scoring a decision tree evaluates at every candidate split during training -- the single number CART/ID3-style tree builders use to greedily pick which feature and threshold to split on.',
    taskDescription: "Implement `information_gain(parent, left, right, criterion='gini')`: compute the chosen impurity measure of `parent`, then subtract the weighted average of the same measure over `left` and `right` (weighted by how many of parent's samples landed in each child).",
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      "criterion must be 'gini' (impurity = 1 - sum(p_c^2)) or 'entropy' (impurity = -sum(p_c * log2(p_c))); raise ValueError for anything else.",
      'An empty parent list should return 0.0 rather than dividing by zero.',
      'A perfectly pure child (all one class) has impurity exactly 0 under both criteria.',
    ],
    hints: {
      small: 'Write one helper that computes impurity(labels, criterion) from class proportions, then call it three times (parent, left, right).',
      strong: 'counts = per-class counts; gini = 1 - sum((c/n)**2 for c in counts.values()); entropy = -sum((c/n)*math.log2(c/n) for c in counts.values()). Weighted child impurity = (len(left)/n)*imp(left) + (len(right)/n)*imp(right).',
      concept: 'A useless split (children have the same class distribution as the parent) always scores an information gain of exactly 0 -- a good sanity check for your implementation, since it means the split told the tree nothing new.',
    },
    conceptConnections: [
      { title: 'Decision Trees, In Full Depth', route: '/docs/machine-learning/decision-tree', description: 'Gini impurity and information gain as the criteria CART/ID3 greedily maximize at every split' },
    ],
    testCases: [
      { id: 'perfect-split-gini', label: 'Perfect Split (Gini)', input: { parent: [0, 0, 1, 1], left: [0, 0], right: [1, 1], criterion: 'gini' }, expectedOutput: 0.5, hidden: false, description: 'A perfectly pure split on a balanced parent gains the maximum possible Gini reduction' },
      { id: 'perfect-split-entropy', label: 'Perfect Split (Entropy)', input: { parent: [0, 0, 1, 1], left: [0, 0], right: [1, 1], criterion: 'entropy' }, expectedOutput: 1.0, hidden: false, description: 'The same split under entropy gains a full 1 bit of information' },
      { id: 'useless-split', label: 'Useless Split (No Gain)', input: { parent: [0, 0, 1, 1], left: [0, 1], right: [0, 1], criterion: 'gini' }, expectedOutput: 0.0, hidden: false, description: 'Both children mirror the parent\'s class distribution exactly' },
      { id: 'balanced-perfect-entropy', label: 'Balanced 6-Sample Perfect Split', input: { parent: [0, 0, 0, 1, 1, 1], left: [0, 0, 0], right: [1, 1, 1], criterion: 'entropy' }, expectedOutput: 1.0, hidden: true },
      { id: 'invalid-criterion', label: 'Invalid Criterion', input: { parent: [0, 1], left: [0], right: [1], criterion: 'invalid' }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-14': {
    id: 'class-ml-prob-14',
    title: 'Gaussian Naive Bayes Classifier',
    difficulty: 'medium',
    topic: 'Classical Machine Learning',
    estimatedTime: '20–25 min',
    functionName: 'gaussian_naive_bayes_predict',
    functionSignature: 'gaussian_naive_bayes_predict(X_train: list[list[float]], y_train: list[int], x_test: list[float]) -> int',
    starterCode: `import math

def gaussian_naive_bayes_predict(X_train, y_train, x_test):
    """Fit a per-class, per-feature Gaussian on X_train/y_train (assuming
    feature independence given the class -- the 'naive' assumption), then
    return the class label that maximizes log(prior) + sum of per-feature
    log Gaussian likelihoods for x_test. Add 1e-9 to every feature's
    variance to avoid division by zero. Break ties by the smaller class
    label."""
    # Your implementation here
    pass
`,
    mission: 'Implement Gaussian Naive Bayes end to end -- parameter estimation (per-class means/variances) AND MAP prediction (log-prior plus log-likelihood, maximized over classes) -- a genuinely different exercise from a single Bayes\'-theorem posterior calculation.',
    taskDescription: 'Implement `gaussian_naive_bayes_predict(X_train, y_train, x_test)`: for each class, estimate its prior and a per-feature Gaussian (mean, variance) from the training rows of that class, then predict the class with the highest log(prior) + sum(log Gaussian pdf) for x_test.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Work in log-space (log-prior + sum of log-likelihoods) to avoid numerical underflow from multiplying many small probabilities.',
      'Add 1e-9 to every estimated variance before using it, to avoid a divide-by-zero on a feature with zero within-class spread.',
      'Break ties between classes by choosing the smaller class label.',
    ],
    hints: {
      small: 'For each class, filter the training rows with that label, then compute each feature\'s mean and variance from just those rows.',
      strong: 'log_score(class) = log(prior) + sum over features of [-0.5*log(2*pi*var) - (x-mean)**2/(2*var)]. Predict argmax over classes of log_score.',
      concept: 'Naive Bayes is "naive" because it assumes every feature is conditionally independent given the class -- almost never exactly true, but the resulting per-feature Gaussian estimates are cheap to fit and the classifier is a genuinely strong, fast baseline in practice despite the wrong assumption.',
    },
    conceptConnections: [
      { title: 'Naive Bayes, LDA & QDA, In Full Depth', route: '/docs/machine-learning/naive-bayes-lda-qda', description: 'The per-class Gaussian likelihood model this problem fits and predicts from' },
    ],
    testCases: [
      { id: 'clearly-class-0', label: 'Clearly Class 0', input: { X_train: [[1.0], [1.2], [0.8], [5.0], [5.2], [4.8]], y_train: [0, 0, 0, 1, 1, 1], x_test: [0.5] }, expectedOutput: 0, hidden: false, description: 'x=0.5 sits well inside the class-0 cluster (mean 1.0)' },
      { id: 'clearly-class-1', label: 'Clearly Class 1', input: { X_train: [[1.0], [1.2], [0.8], [5.0], [5.2], [4.8]], y_train: [0, 0, 0, 1, 1, 1], x_test: [4.5] }, expectedOutput: 1, hidden: false, description: 'x=4.5 sits well inside the class-1 cluster (mean 5.0)' },
      { id: 'two-feature-case', label: 'Two Features', input: { X_train: [[0.0, 0.0], [0.2, -0.1], [-0.1, 0.1], [10.0, 10.0], [10.2, 9.8], [9.9, 10.1]], y_train: [0, 0, 0, 1, 1, 1], x_test: [9.8, 10.0] }, expectedOutput: 1, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-15': {
    id: 'class-ml-prob-15',
    title: 'SVM Hinge Loss & Margin',
    difficulty: 'medium',
    topic: 'Classical Machine Learning',
    estimatedTime: '15–20 min',
    functionName: 'svm_hinge_loss',
    functionSignature: 'svm_hinge_loss(X: list[list[float]], y: list[int], weights: list[float], bias: float, C: float = 1.0) -> float',
    starterCode: `def svm_hinge_loss(X, y, weights, bias, C=1.0):
    """X: feature rows. y: labels, each -1 or +1 (NOT 0/1). weights, bias,
    C: model parameters. Return the soft-margin SVM primal objective:
    0.5 * ||weights||^2 + C * mean_i(max(0, 1 - y_i * (w.x_i + b)))."""
    # Your implementation here
    pass
`,
    mission: 'Implement the soft-margin SVM objective directly -- the L2 margin-maximizing regularizer plus the hinge loss that only penalizes points inside (or on the wrong side of) the margin, distinct from every other loss function on this site because correctly-classified points beyond the margin contribute exactly zero.',
    taskDescription: 'Implement `svm_hinge_loss(X, y, weights, bias, C=1.0)`: compute 0.5 * sum(w_j^2) (the margin-maximizing regularizer) plus C times the mean hinge loss max(0, 1 - y_i*(w.x_i + b)) across all rows. Labels are +1/-1, not 0/1.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Labels are +1 or -1 (the standard SVM convention), not 0/1.',
      'The hinge term is 0 for any point already correctly classified with margin >= 1 -- only margin violations (including misclassifications) contribute.',
      'Average the per-row hinge loss (divide by the number of rows) before multiplying by C.',
    ],
    hints: {
      small: 'For each row, the "raw margin" is y_i * (w.x_i + b); the hinge loss for that row is max(0, 1 - raw_margin).',
      strong: 'reg = 0.5 * sum(w*w for w in weights); margin_i = y_i * (dot(weights, X[i]) + bias); hinge_i = max(0, 1 - margin_i); return reg + C * mean(hinge_i).',
      concept: 'Setting C=0 leaves only the regularizer (0.5*||w||^2) -- with no data term at all, an SVM trained this way would collapse to w=0, which is exactly why C controls the real tradeoff between a wide margin and correctly classifying every training point.',
    },
    conceptConnections: [
      { title: 'Support Vector Machines (SVM & SVR), In Full Depth', route: '/docs/machine-learning/support-vector-machines', description: 'The margin + hinge-loss objective this problem computes directly' },
    ],
    testCases: [
      { id: 'one-violation', label: 'One Correctly-Classified, One Violating', input: { X: [[1, 1], [2, 2]], y: [1, -1], weights: [1.0, 0.0], bias: 0.0, C: 1.0 }, expectedOutput: 2.0, hidden: false, description: 'Row 2 lands on the wrong side of the boundary and dominates the hinge term' },
      { id: 'both-on-boundary-ish', label: 'Symmetric Violations', input: { X: [[1, 0], [-1, 0]], y: [1, -1], weights: [2.0, 0.0], bias: 0.0, C: 1.0 }, expectedOutput: 2.0, hidden: false },
      { id: 'small-weight-violations', label: 'Small Weights, Both Violate', input: { X: [[3, 0], [-3, 0]], y: [1, -1], weights: [0.1, 0.0], bias: 0.0, C: 1.0 }, expectedOutput: 0.705, hidden: true },
      { id: 'zero-C', label: 'C = 0 Ignores the Hinge Term Entirely', input: { X: [[1, 1]], y: [-1], weights: [1.0, 1.0], bias: 0.0, C: 0.0 }, expectedOutput: 1.0, hidden: true, description: 'With C=0, only the 0.5*||w||^2 regularizer remains, regardless of how badly the point is misclassified' },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-16': {
    id: 'class-ml-prob-16',
    title: 'K-Fold Cross-Validation Split Generation',
    difficulty: 'medium',
    topic: 'Classical Machine Learning',
    estimatedTime: '15–20 min',
    functionName: 'k_fold_splits',
    functionSignature: 'k_fold_splits(n_samples: int, k: int) -> list',
    starterCode: `def k_fold_splits(n_samples, k):
    """Return a list of k [train_indices, val_indices] pairs (both plain
    lists of 0-indexed ints) splitting range(n_samples) into k
    contiguous, near-equal folds (no shuffling). If n_samples doesn't
    divide evenly by k, the first (n_samples % k) folds get one extra
    sample. Raise ValueError if k <= 1 or k > n_samples."""
    # Your implementation here
    pass
`,
    mission: 'Implement the actual index bookkeeping behind k-fold cross-validation -- the fold-size arithmetic and train/validation partitioning every CV loop is built on top of, independent of whatever model gets trained on each fold.',
    taskDescription: 'Implement `k_fold_splits(n_samples, k)`: partition range(n_samples) into k contiguous folds of size n_samples//k (the first n_samples % k folds get one extra sample), then return k [train_indices, val_indices] pairs, one per fold held out as validation.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'No shuffling -- folds are contiguous blocks of range(n_samples), in order.',
      'Fold sizes: n_samples // k for every fold, plus one extra sample for each of the first (n_samples % k) folds.',
      'For each of the k pairs, val_indices is that one fold and train_indices is every index NOT in that fold (order within train_indices should follow the other folds\' natural order).',
      'Raise ValueError if k <= 1 or k > n_samples.',
    ],
    hints: {
      small: 'First compute how big each of the k folds should be, then slice range(n_samples) into that many contiguous chunks.',
      strong: 'fold_sizes = [n//k + (1 if i < n%k else 0) for i in range(k)]; slice indices into folds using running offsets; for each i, val=folds[i], train=every index from every other fold.',
      concept: 'This is exactly scikit-learn\'s `KFold(shuffle=False)` splitting rule -- contiguous blocks with the remainder distributed one-per-fold across the first folds, not padded onto the last fold, which keeps fold sizes as balanced as integer division allows.',
    },
    conceptConnections: [
      { title: 'Hyperparameter Optimization', route: '/docs/machine-learning/hyperparameter-optimization', description: 'K-fold cross-validation as the standard way to evaluate a model/hyperparameter choice without a single lucky (or unlucky) train/test split' },
    ],
    testCases: [
      { id: 'uneven-split', label: '10 Samples, 3 Folds (Uneven)', input: { n_samples: 10, k: 3 }, expectedOutput: [[[4, 5, 6, 7, 8, 9], [0, 1, 2, 3]], [[0, 1, 2, 3, 7, 8, 9], [4, 5, 6]], [[0, 1, 2, 3, 4, 5, 6], [7, 8, 9]]], hidden: false, description: '10 does not divide evenly by 3 -- the first fold gets 4 samples, the rest get 3' },
      { id: 'leave-one-out', label: '5 Samples, 5 Folds (Leave-One-Out)', input: { n_samples: 5, k: 5 }, expectedOutput: [[[1, 2, 3, 4], [0]], [[0, 2, 3, 4], [1]], [[0, 1, 3, 4], [2]], [[0, 1, 2, 4], [3]], [[0, 1, 2, 3], [4]]], hidden: true, description: 'k == n_samples degenerates into leave-one-out CV' },
      { id: 'k-too-large', label: 'k Exceeds n_samples', input: { n_samples: 3, k: 5 }, expectError: 'ValueError', hidden: true },
      { id: 'k-too-small', label: 'k = 1 Is Not a Valid Split', input: { n_samples: 10, k: 1 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-23': {
    id: 'class-ml-prob-23',
    title: 'PCA: Explained Variance Ratio via Eigendecomposition',
    difficulty: 'hard',
    topic: 'Classical Machine Learning',
    estimatedTime: '20–25 min',
    functionName: 'pca_explained_variance_ratio',
    functionSignature: 'pca_explained_variance_ratio(X: list[list[float]], k: int) -> list[float]',
    starterCode: `import numpy as np

def pca_explained_variance_ratio(X, k):
    """X: list of feature rows. k: number of top principal components.
    Center X (subtract each column's mean), compute its covariance
    matrix, eigendecompose it, and return the top-k eigenvalues each
    divided by the sum of ALL eigenvalues -- the fraction of total
    variance each of the top-k principal components explains, sorted
    descending."""
    # Your implementation here
    pass
`,
    mission: 'Implement the real quantity behind every PCA "scree plot" and "how many components do I need to keep 95% of the variance?" decision -- computed from first principles via covariance-matrix eigendecomposition, the same route sklearn\'s PCA takes internally for dense data.',
    taskDescription: 'Implement `pca_explained_variance_ratio(X, k)`: mean-center X, form its (d x d) covariance matrix, eigendecompose it with `np.linalg.eigh`, sort eigenvalues descending, and return the top-k eigenvalues divided by the sum of all eigenvalues.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python (closed-form 2x2 eigenvalue formula) implementation',
    constraints: [
      'NumPy is recommended for eigendecomposition (np.linalg.eigh, since the covariance matrix is always symmetric); every test case here is 2D, so a pure-Python closed-form 2x2 eigenvalue solution also works and earns the bonus.',
      'Use the sample covariance (divide by n-1, matching np.cov\'s default and pandas/sklearn convention).',
      'Deliberately returns variance RATIOS, not the transformed data -- this sidesteps eigenvector sign ambiguity (eigenvectors are only unique up to a sign flip) entirely, since eigenvalues carry no sign ambiguity.',
    ],
    hints: {
      small: 'np.cov(X, rowvar=False) gives you the covariance matrix directly if you don\'t want to center X by hand.',
      strong: 'Xc = X - X.mean(axis=0); cov = (Xc.T @ Xc) / (n - 1); eigvals = np.linalg.eigh(cov)[0]; sort descending; ratio = top_k / eigvals.sum().',
      concept: 'The eigenvalues of the covariance matrix ARE the variances along each principal axis -- the eigenvector with the largest eigenvalue points along the direction of maximum spread in the data, which is precisely what "the first principal component" means.',
    },
    conceptConnections: [
      { title: 'PCA, Kernel PCA & Truncated SVD, In Full Depth', route: '/docs/machine-learning/pca-svd', description: 'The covariance-eigendecomposition route to PCA this problem implements directly' },
    ],
    testCases: [
      { id: 'perfectly-collinear', label: 'Perfectly Collinear Data', input: { X: [[1, 2], [3, 4], [5, 6], [7, 8]], k: 2 }, expectedOutput: [1.0, 0.0], hidden: false, description: 'All 4 points lie exactly on a line -- 100% of variance is along one direction' },
      { id: 'classic-pca-example', label: 'Classic 2D PCA Textbook Dataset', input: { X: [[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0], [2.3, 2.7], [2.0, 1.6], [1.0, 1.1], [1.5, 1.6], [1.1, 0.9]], k: 1 }, expectedOutput: [0.9631813143], hidden: false, description: 'The first principal component alone captures ~96.3% of the variance in this well-known example' },
      { id: 'both-components', label: 'Both Components Sum to 1.0', input: { X: [[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0], [2.3, 2.7], [2.0, 1.6], [1.0, 1.1], [1.5, 1.6], [1.1, 0.9]], k: 2 }, expectedOutput: [0.9631813143, 0.0368186857], hidden: true, description: 'Requesting every component must recover ratios that sum to exactly 1.0' },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'class-ml-prob-24': {
    id: 'class-ml-prob-24',
    title: 'ROC AUC From Scratch (Rank-Based)',
    difficulty: 'hard',
    topic: 'Classical Machine Learning',
    estimatedTime: '20–25 min',
    functionName: 'compute_auc',
    functionSignature: 'compute_auc(y_true: list[int], y_scores: list[float]) -> float',
    starterCode: `def compute_auc(y_true, y_scores):
    """y_true: 0/1 labels. y_scores: a predicted score per example (higher
    = more likely positive). Return the ROC AUC using the Mann-Whitney
    rank formula: AUC = (sum of ranks of the positive examples -
    n_pos*(n_pos+1)/2) / (n_pos * n_neg), where ranks are 1-indexed over
    y_scores sorted ascending, with tied scores given the AVERAGE rank of
    their tied positions. Raise ValueError if y_true has only one class."""
    # Your implementation here
    pass
`,
    mission: 'Implement ROC AUC via the exact rank-based (Mann-Whitney U) formula, which is mathematically identical to the trapezoidal-rule area under the ROC curve but needs no threshold sweep -- and is exactly what "AUC is the probability a random positive scores higher than a random negative" means, made computational.',
    taskDescription: 'Implement `compute_auc(y_true, y_scores)`: rank all scores ascending (tied scores share the average of their tied rank positions), sum the ranks belonging to positive examples, then apply AUC = (sum_ranks_pos - n_pos*(n_pos+1)/2) / (n_pos*n_neg).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'y_true must contain both 0 and 1 -- raise ValueError otherwise (AUC is undefined for a single class).',
      'Tied scores must share the AVERAGE of the rank positions they span (this is what correctly gives a tied pos/neg pair a "half win" instead of an arbitrary full win or loss).',
      'Ranks are 1-indexed over the ascending-sorted scores.',
    ],
    hints: {
      small: 'Sort (score, label) pairs by score ascending. Every distinct score value should get one shared "average rank" across all examples tied at that value.',
      strong: 'Group equal-score examples together; assign each group the average of the 1-indexed positions it spans. Then AUC = (sum of ranks among label==1 examples - n_pos*(n_pos+1)/2) / (n_pos*n_neg).',
      concept: 'AUC = 0.5 always means "no better than random" (a random scorer ties in expectation), which is why the Mann-Whitney interpretation -- the probability a randomly chosen positive outranks a randomly chosen negative -- is the single most useful intuition for reading an AUC number.',
    },
    conceptConnections: [
      { title: 'Model Evaluation & Metrics', route: '/docs/machine-learning/model-evaluation-metrics', description: 'ROC AUC as a threshold-independent classifier quality metric' },
    ],
    testCases: [
      { id: 'no-ties', label: 'No Ties, One Discordant Pair', input: { y_true: [0, 0, 1, 1], y_scores: [0.1, 0.4, 0.35, 0.8] }, expectedOutput: 0.75, hidden: false, description: '3 of 4 positive/negative pairs are correctly ordered' },
      { id: 'reordered-labels', label: 'Interleaved Labels', input: { y_true: [1, 0, 1, 0], y_scores: [0.9, 0.8, 0.7, 0.6] }, expectedOutput: 0.75, hidden: false },
      { id: 'all-ties', label: 'All Scores Tied in Pairs', input: { y_true: [0, 1, 0, 1], y_scores: [0.2, 0.2, 0.6, 0.6] }, expectedOutput: 0.5, hidden: true, description: 'Every positive/negative pair is a tie, each worth exactly 0.5' },
      { id: 'single-class', label: 'Only One Class Present', input: { y_true: [1, 1, 1], y_scores: [0.1, 0.2, 0.3] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'class-ml-prob-25': {
    id: 'class-ml-prob-25',
    title: 'Silhouette Score for Cluster Quality',
    difficulty: 'hard',
    topic: 'Classical Machine Learning',
    estimatedTime: '20–25 min',
    functionName: 'silhouette_score',
    functionSignature: 'silhouette_score(X: list[list[float]], labels: list[int]) -> float',
    starterCode: `import math

def silhouette_score(X, labels):
    """X: feature rows. labels: a cluster assignment per row. For each
    point i: a(i) = mean Euclidean distance to other points in its own
    cluster (0.0 if its cluster has no other members); b(i) = the
    smallest mean Euclidean distance to any OTHER cluster's points;
    s(i) = (b(i)-a(i)) / max(a(i), b(i)), or 0.0 if that max is 0, or 0.0
    if i's own cluster has size 1. Return the mean of s(i) over all
    points. Raise ValueError if fewer than 2 clusters are present."""
    # Your implementation here
    pass
`,
    mission: 'Implement the silhouette score -- the standard way to numerically evaluate a clustering (like K-Means\' output) WITHOUT ground-truth labels, by checking whether every point is closer to its own cluster than to the nearest other one.',
    taskDescription: 'Implement `silhouette_score(X, labels)`: for every point, compute its mean in-cluster distance a(i) and its mean distance to the nearest other cluster b(i), combine them into s(i) = (b-a)/max(a,b), and return the mean s(i) across all points.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Use Euclidean distance between rows of X.',
      'A point in a singleton cluster (no other members) gets s(i) = 0.0 by convention (this matches scikit-learn\'s own behavior).',
      'Raise ValueError if labels contains fewer than 2 distinct clusters (silhouette is undefined for a single cluster).',
      'The overall score is bounded in [-1, 1]: near +1 means well-separated clusters, near 0 means overlapping clusters, negative means points are likely in the wrong cluster.',
    ],
    hints: {
      small: 'For point i, a(i) only looks at OTHER members of i\'s own cluster; b(i) looks at every OTHER cluster\'s full membership and takes the closest one.',
      strong: 'a(i) = mean(dist(i,j) for j in same cluster, j != i); for every other cluster, compute mean(dist(i,j) for j in that cluster), and b(i) = the minimum of those means over all other clusters; s(i) = (b(i)-a(i))/max(a(i),b(i)).',
      concept: 'This is exactly the metric you would use to numerically justify a choice of k in K-Means (as an alternative to the more subjective elbow method) -- compute the mean silhouette score for several values of k and pick the one that maximizes it.',
    },
    conceptConnections: [
      { title: 'K-Means & Hierarchical Clustering, In Full Depth', route: '/docs/machine-learning/kmeans-hierarchical-clustering', description: 'Silhouette score as the standard way to numerically evaluate a clustering result' },
    ],
    testCases: [
      { id: 'well-separated', label: 'Two Well-Separated Clusters', input: { X: [[1, 1], [1.5, 2], [8, 8], [8.5, 8.5]], labels: [0, 0, 1, 1] }, expectedOutput: 0.9059559942468866, hidden: false, description: 'Tight, far-apart clusters score close to the maximum of 1.0' },
      { id: 'singleton-clusters', label: 'Two Singleton Clusters', input: { X: [[0, 0], [10, 10]], labels: [0, 1] }, expectedOutput: 0.0, hidden: true, description: 'Every point is alone in its own cluster, so every s(i) is 0.0 by convention' },
      { id: 'single-cluster-error', label: 'Only One Cluster Present', input: { X: [[0, 0], [1, 1]], labels: [0, 0] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
};

import curriculum500Data from '../data/curriculum500.json';

export interface CurriculumProblemItem {
  rank: number;
  id: string;
  title: string;
  category: string;
  stage: string;
  stageNumber: number;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  prerequisite: string | null;
  functionName: string;
  functionSignature: string;
  starterCode: string;
  testCases: PracticeTestCase[];
}

const CURRICULUM_MAP = new Map<string, CurriculumProblemItem>();
for (const item of curriculum500Data as CurriculumProblemItem[]) {
  CURRICULUM_MAP.set(item.id, item);
}

/**
 * Dynamic problem builder for any un-configured practice problem.
 * Ensures EVERY practice problem in the platform automatically renders in
 * the full-screen interactive AI/ML IDE workspace (PracticeWorkspace) rather
 * than falling back to an unmigrated MDX page layout.
 */
function createFallbackProblem(
  problemId: string,
  title?: string,
  difficulty?: 'easy' | 'medium' | 'hard',
  topic?: string,
): PracticeProblem {
  const cleanId = problemId.replace(/\/$/, '').replace(/^\/practice\//, '');

  if (CURRICULUM_MAP.has(cleanId)) {
    const item = CURRICULUM_MAP.get(cleanId)!;
    return {
      id: item.id,
      title: item.title,
      difficulty: item.difficulty,
      topic: item.topic,
      estimatedTime: item.difficulty === 'easy' ? '10–15 min' : item.difficulty === 'medium' ? '15–20 min' : '25–30 min',
      functionName: item.functionName,
      functionSignature: item.functionSignature,
      starterCode: item.starterCode,
      mission: `Implement ${item.title} to master core AI engineering concepts in ${item.topic}.`,
      taskDescription: `Implement \`${item.functionName}\` in Python. Test cases verify edge cases and functional requirements.`,
      libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
      bonusPoints: 10,
      bonusDescription: 'Pure Python implementation',
      constraints: [
        'Libraries (NumPy, PyTorch, SciPy) are allowed and accepted normally.',
        'Pure Python (no external libraries) earns +10 Bonus XP!',
        'Must handle edge cases cleanly.',
      ],
      hints: {
        small: `Focus on the core algorithm for ${item.topic}.`,
        strong: `Start with base/edge cases then implement the main mathematical logic.`,
        concept: `This problem builds core mastery in ${item.category} (${item.stage}).`,
      },
      testCases: item.testCases,
      runtime: { language: 'python', capabilities: ['python', 'numpy', 'pytorch'] },
      judgeMode: 'hybrid',
      prerequisite: item.prerequisite,
      stage: item.stage,
      stageNumber: item.stageNumber,
      points: item.points,
    };
  }

  const displayTitle =
    title ??
    cleanId
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const functionName = cleanId.replace(/-/g, '_');
  const isDesign = cleanId.startsWith('design-challenge');

  return {
    id: cleanId,
    title: isDesign ? `System Design: ${displayTitle.replace('Design Challenge ', '')}` : displayTitle,
    difficulty: difficulty ?? (isDesign ? 'hard' : 'medium'),
    topic: topic ?? (isDesign ? 'System Design' : 'AI Systems & Algorithmic Foundations'),
    estimatedTime: isDesign ? '20–30 min' : '15–20 min',
    functionName,
    functionSignature: `${functionName}(*args, **kwargs)`,
    starterCode: `def ${functionName}(*args, **kwargs):
    """Implement ${displayTitle}.
    
    Return the expected output according to the problem specification below."""
    # Your implementation here
    pass
`,
    mission: `Implement ${displayTitle} and verify your implementation in the interactive AI/ML IDE workspace.`,
    taskDescription: `Implement \`${functionName}\`. Libraries (NumPy, PyTorch, SciPy) are allowed, but Pure Python implementations earn bonus XP!`,
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (NumPy, PyTorch, SciPy) are allowed and accepted normally.',
      'Pure Python (no external libraries) earns +10 Bonus XP!',
      'Must handle edge cases (empty inputs, invalid shapes, boundary conditions) correctly.',
    ],
    hints: {
      small: 'Read the mathematical intuition and problem formulation in the Worked Intuition section below.',
      strong: 'Check edge cases first (empty inputs, shape mismatches), then compute the core formula.',
      concept: 'This core operation forms a key building block in modern AI systems and engineering architectures.',
    },
    testCases: [
      { id: 'smoke-test', label: 'Smoke Test', input: {}, expectedOutput: undefined, hidden: false, description: 'Executes your function against default test inputs.' },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy', 'pytorch'] },
  };
}

export function getPracticeProblem(problemId: string): PracticeProblem | undefined {
  const cleanId = problemId.replace(/\/$/, '').replace(/^\/practice\//, '');
  if (PRACTICE_PROBLEMS[cleanId]) {
    return PRACTICE_PROBLEMS[cleanId];
  }

  if (CURRICULUM_MAP.has(cleanId)) {
    return createFallbackProblem(cleanId);
  }

  // Check if cleanId matches a real practice problem in contentTree
  const allPractice = getAllDocPracticeProblems();
  const matchedPage = allPractice.find(
    (p) => p.slug.split('/').pop() === cleanId || p.route.endsWith(`/${cleanId}`),
  );

  if (matchedPage) {
    return createFallbackProblem(
      cleanId,
      matchedPage.title,
      matchedPage.difficulty as 'easy' | 'medium' | 'hard' | undefined,
      matchedPage.topic,
    );
  }

  return undefined;
}

