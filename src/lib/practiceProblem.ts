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

  // --- Agents, MCP & Systems batch 1 (ranks 431-445) -- real content
  // replacing the generic Stage 8 placeholder template. Function names,
  // test cases, and reference solutions were hand-written and every
  // testCase.expectedOutput was computed by actually running the
  // reference implementation (see the practice-problems-initiative
  // pattern), not guessed.
  'agents-mcp-systems-prob-1': {
    id: 'agents-mcp-systems-prob-1',
    title: 'Sliding-Window Text Chunking for RAG',
    difficulty: 'easy',
    topic: 'Retrieval-Augmented Generation',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'chunk_text',
    functionSignature: 'chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]',
    starterCode: `def chunk_text(text, chunk_size, overlap):
    """Split text into overlapping fixed-size chunks for a RAG ingestion
    pipeline. Each chunk after the first starts (chunk_size - overlap)
    characters after the previous chunk's start. Raise ValueError if
    chunk_size <= 0 or if overlap is not in [0, chunk_size)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the sliding-window chunker that turns a raw document into the overlapping text chunks a RAG pipeline actually embeds and indexes -- the overlap is what stops a fact from being silently cut in half at a chunk boundary.',
    taskDescription: 'Implement `chunk_text(text, chunk_size, overlap)`, returning a list of chunks. Each chunk is up to `chunk_size` characters; consecutive chunks start `chunk_size - overlap` characters apart. The last chunk may be shorter. Return `[]` for empty text.',
    constraints: [
      'Must raise ValueError if chunk_size <= 0.',
      'Must raise ValueError if overlap < 0 or overlap >= chunk_size (no forward progress otherwise).',
      'Empty text returns an empty list, not an error.',
      'The final chunk should include the tail of the text even if shorter than chunk_size.',
    ],
    hints: {
      small: 'Track a start index `i` and slice `text[i:i+chunk_size]`. Advance `i` by `chunk_size - overlap` each step.',
      strong: 'Stop advancing once `i + chunk_size >= len(text)` -- append that final (possibly short) slice and break, rather than looping past the end of the string.',
      concept: 'Overlap exists because a naive non-overlapping split can cut a sentence -- and the fact inside it -- exactly at a chunk boundary, so neither chunk alone contains the whole idea to embed and retrieve.',
    },
    conceptConnections: [
      { title: 'Retrieval-Augmented Generation', route: '/docs/llms-genai/rag', description: 'Chunking is the first step of a RAG ingestion pipeline, before embedding and indexing' },
    ],
    testCases: [
      { id: 'basic', label: 'Overlapping Chunks', input: { text: 'ABCDEFGHIJ', chunk_size: 4, overlap: 1 }, expectedOutput: ['ABCD', 'DEFG', 'GHIJ'], hidden: false, description: 'step = 4 - 1 = 3; last chunk lands exactly on the tail' },
      { id: 'short-text', label: 'Text Shorter Than Chunk Size', input: { text: 'Hi', chunk_size: 10, overlap: 2 }, expectedOutput: ['Hi'], hidden: false, description: 'A single chunk covers the whole short string' },
      { id: 'empty', label: 'Empty Text', input: { text: '', chunk_size: 4, overlap: 1 }, expectedOutput: [], hidden: false },
      { id: 'no-overlap', label: 'Zero Overlap', input: { text: 'ABCDEFGH', chunk_size: 4, overlap: 0 }, expectedOutput: ['ABCD', 'EFGH'], hidden: true, description: 'step = chunk_size, i.e. a plain non-overlapping split' },
      { id: 'bad-overlap', label: 'Overlap Equals Chunk Size', input: { text: 'abcdef', chunk_size: 5, overlap: 5 }, expectError: 'ValueError', hidden: true, description: 'overlap >= chunk_size would never advance -- must raise' },
      { id: 'bad-chunk-size', label: 'Non-Positive Chunk Size', input: { text: 'abcdef', chunk_size: 0, overlap: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-2': {
    id: 'agents-mcp-systems-prob-2',
    title: 'Parse a ReAct Agent Action String',
    difficulty: 'easy',
    topic: 'Agent Orchestration',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'parse_react_action',
    functionSignature: 'parse_react_action(text: str) -> tuple[str, str]',
    starterCode: `import re

def parse_react_action(text):
    """Parse a ReAct-style agent line of the exact form
    "Action: tool_name[argument text]" into (tool_name, argument text).
    Leading/trailing whitespace on the whole line is ignored. Raise
    ValueError if the line doesn't match that exact shape."""
    # Your implementation here
    pass
`,
    mission: 'Implement the parser that turns a ReAct agent\'s free-text "Action: tool[arg]" line into a real (tool_name, argument) pair the agent loop can actually dispatch -- the same parsing step every ReAct-style agent framework needs between "the LLM said this" and "call this tool with this input".',
    taskDescription: 'Implement `parse_react_action(text)`. `text` is one line of the form `Action: tool_name[argument text]`. Return `(tool_name, argument_text)`. Raise `ValueError` if the line does not match that exact shape (missing `Action:` prefix, missing brackets, etc.).',
    constraints: [
      'The tool name matches `[A-Za-z_][A-Za-z0-9_]*` (a valid identifier).',
      'The argument text is everything between the first `[` after the tool name and the final `]` -- it may itself contain spaces, punctuation, or digits.',
      'Leading/trailing whitespace around the whole line must be stripped before matching.',
      'Any line not matching `Action: name[...]` exactly must raise ValueError.',
    ],
    hints: {
      small: 'Strip the input first, then match it against a regex anchored with `^` and `$` so trailing garbage is rejected too.',
      strong: 'Pattern: `^Action:\\s*([A-Za-z_][A-Za-z0-9_]*)\\[(.*)\\]$`. If `re.match` returns None, raise ValueError; otherwise return the two captured groups as a tuple.',
      concept: 'ReAct interleaves free-text "Thought" / "Action" / "Observation" steps -- the Action line is the one point where unstructured LLM text has to become a structured tool call the runtime can actually execute, so this parse boundary has to fail loudly on malformed input rather than silently misfire a tool.',
    },
    conceptConnections: [
      { title: 'Agent Loops & Graphs', route: '/docs/agents/loops-and-graphs', description: 'The ReAct Thought/Action/Observation loop this action line is one step of' },
    ],
    testCases: [
      { id: 'basic', label: 'Simple Action', input: { text: 'Action: search[capital of France]' }, expectedOutput: ['search', 'capital of France'], hidden: false },
      { id: 'whitespace', label: 'Surrounding Whitespace', input: { text: '  Action: lookup[Einstein]  ' }, expectedOutput: ['lookup', 'Einstein'], hidden: false, description: 'Whitespace around the whole line is stripped before matching' },
      { id: 'missing-prefix', label: 'Missing "Action:" Prefix', input: { text: 'search[capital of France]' }, expectError: 'ValueError', hidden: false },
      { id: 'wrong-brackets', label: 'Parentheses Instead of Brackets', input: { text: 'Action: search(capital of France)' }, expectError: 'ValueError', hidden: true },
      { id: 'numeric-arg', label: 'Argument With Digits and Punctuation', input: { text: 'Action: calculator[2 + 2 = ?]' }, expectedOutput: ['calculator', '2 + 2 = ?'], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-3': {
    id: 'agents-mcp-systems-prob-3',
    title: 'Validate an MCP Tool-Call Payload',
    difficulty: 'easy',
    topic: 'Model Context Protocol',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'validate_mcp_tool_call',
    functionSignature: 'validate_mcp_tool_call(schema: dict, payload: dict) -> list[str]',
    starterCode: `def validate_mcp_tool_call(schema, payload):
    """schema maps field name -> type name ('string' | 'number' |
    'boolean' | 'array' | 'object'). Validate payload against schema and
    return a list of human-readable error strings (empty list = valid).
    Report a missing field as "missing required field: <field>" and a
    type mismatch as "field <field>: expected <type>, got <actual>",
    where <actual> is Python's real type name (e.g. "int", "str")."""
    # Your implementation here
    pass
`,
    mission: 'Implement the request-shape validator every MCP server needs before it trusts a tool-call payload -- an MCP tool is only as safe as the check that runs before its arguments ever reach real code.',
    taskDescription: 'Implement `validate_mcp_tool_call(schema, payload)`. For each `field: type` pair in `schema` (in schema order): if `field` is missing from `payload`, append `"missing required field: {field}"`; if present but the wrong Python type for `type`, append `"field {field}: expected {type}, got {actual_type_name}"` (using Python\'s real type name, e.g. `int`, `str`, `bool`). Return the list of error strings (empty means valid). Treat `"number"` as accepting both `int` and `float`, but reject a `bool` value for `"number"` explicitly (Python bools are technically ints) with the message `"field {field}: expected number, got boolean"`.',
    constraints: [
      'Iterate schema fields in the order they appear in `schema`.',
      '`"number"` accepts int or float, but not bool (bool must report "got boolean").',
      '`"string"`/`"boolean"`/`"array"`/`"object"` map to Python str/bool/list/dict respectively.',
      'A field missing from payload is reported once and does not also get a type-mismatch entry.',
    ],
    hints: {
      small: 'Build a small type-name -> Python type map, then loop over `schema.items()` checking membership and `isinstance`.',
      strong: 'Special-case `expected_type == "number" and isinstance(value, bool)` before the general isinstance check, since `isinstance(True, int)` is True in Python and would otherwise silently pass.',
      concept: 'MCP tool calls arrive over JSON-RPC as untyped JSON -- the server has no compile-time guarantee the client sent the right shape, so this kind of runtime schema check is the actual boundary between "arbitrary JSON from the wire" and "safe to call the underlying Python function with".',
    },
    conceptConnections: [
      { title: 'MCP Protocol Deep Dive', route: '/docs/agents/mcp/protocol-deep-dive', description: 'Tool-call argument validation at the MCP server boundary' },
    ],
    testCases: [
      { id: 'valid', label: 'Fully Valid Payload', input: { schema: { query: 'string', top_k: 'number' }, payload: { query: 'hello', top_k: 5 } }, expectedOutput: [], hidden: false },
      { id: 'missing-field', label: 'Missing Required Field', input: { schema: { query: 'string', top_k: 'number' }, payload: { query: 'hello' } }, expectedOutput: ['missing required field: top_k'], hidden: false },
      { id: 'wrong-type', label: 'Wrong Type', input: { schema: { query: 'string', top_k: 'number' }, payload: { query: 123, top_k: 5 } }, expectedOutput: ['field query: expected string, got int'], hidden: false },
      { id: 'bool-as-number', label: 'Boolean Rejected for Number', input: { schema: { query: 'string', top_k: 'number' }, payload: { query: 'hi', top_k: true } }, expectedOutput: ['field top_k: expected number, got boolean'], hidden: true },
      { id: 'array-ok', label: 'Array Field Valid', input: { schema: { items: 'array' }, payload: { items: [1, 2, 3] } }, expectedOutput: [], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-4': {
    id: 'agents-mcp-systems-prob-4',
    title: 'Exponential Moving Average for Metric Smoothing',
    difficulty: 'easy',
    topic: 'MLOps & Deployment',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'ema',
    functionSignature: 'ema(values: list[float], alpha: float) -> list[float]',
    starterCode: `def ema(values, alpha):
    """Return the exponential moving average of values: result[0] =
    values[0]; result[i] = alpha*values[i] + (1-alpha)*result[i-1].
    Raise ValueError if values is empty or alpha is not in (0, 1]."""
    # Your implementation here
    pass
`,
    mission: 'Implement the exponential moving average used to smooth a noisy live metric stream (request latency, error rate) into the stable signal an alerting or autoscaling system actually reacts to.',
    taskDescription: 'Implement `ema(values, alpha)`. `result[0] = values[0]`, then `result[i] = alpha * values[i] + (1 - alpha) * result[i-1]` for each later value. Raise `ValueError` if `values` is empty or `alpha` is not in `(0, 1]`.',
    constraints: [
      'Must raise ValueError for an empty `values` list.',
      'Must raise ValueError if alpha <= 0 or alpha > 1.',
      'alpha = 1 means result equals values exactly (no smoothing).',
      'Returned list has the same length as `values`.',
    ],
    hints: {
      small: 'Seed a result list with `values[0]`, then loop over the remaining values, appending `alpha * v + (1 - alpha) * result[-1]` each time.',
      strong: 'Validate `values` and `alpha` first (raise before touching `values[0]`), then a single pass with a running `previous` value is enough -- no need to look further back than one step.',
      concept: 'A higher alpha weights recent samples more (reacts fast, noisier); a lower alpha weights history more (smoother, slower to react) -- the same latency-vs-stability tradeoff behind every dashboard smoothing slider and canary-analysis metric.',
    },
    conceptConnections: [
      { title: 'Monitoring & Drift Detection', route: '/docs/mlops/monitoring-and-drift', description: 'Smoothed metrics are what production alerting and drift detection actually threshold against' },
    ],
    testCases: [
      { id: 'basic', label: 'Three-Point Smoothing', input: { values: [10, 20, 30], alpha: 0.5 }, expectedOutput: [10, 15, 22.5], hidden: false },
      { id: 'single-value', label: 'Single Value', input: { values: [100], alpha: 0.3 }, expectedOutput: [100], hidden: false },
      { id: 'alpha-one', label: 'Alpha of 1 -- No Smoothing', input: { values: [1, 2, 3], alpha: 1 }, expectedOutput: [1, 2, 3], hidden: false },
      { id: 'empty-values', label: 'Empty Values List', input: { values: [], alpha: 0.5 }, expectError: 'ValueError', hidden: true },
      { id: 'zero-alpha', label: 'Alpha of Zero', input: { values: [1, 2, 3], alpha: 0 }, expectError: 'ValueError', hidden: true, description: 'alpha must be in (0, 1], so 0 is invalid (the series would never update)' },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-5': {
    id: 'agents-mcp-systems-prob-5',
    title: 'Token Bucket Rate Limiter',
    difficulty: 'medium',
    topic: 'Distributed Systems',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'token_bucket_allow',
    functionSignature: 'token_bucket_allow(timestamps: list[float], capacity: int, refill_rate: float) -> list[bool]',
    starterCode: `def token_bucket_allow(timestamps, capacity, refill_rate):
    """Simulate a token-bucket rate limiter. The bucket starts full
    (capacity tokens). For each timestamp (seconds, non-decreasing), first
    refill by (elapsed_seconds * refill_rate) tokens (capped at capacity),
    then allow the request (and consume 1 token) if at least 1 token is
    available, else deny it. Return the list of allow/deny booleans, one
    per timestamp. Raise ValueError if capacity <= 0 or timestamps are not
    non-decreasing."""
    # Your implementation here
    pass
`,
    mission: 'Implement the token-bucket algorithm that real API gateways and MCP servers use to rate-limit clients -- allow bursts up to a capacity, then throttle to a steady refill rate, rather than a naive fixed-window counter that lets a client burst at every window boundary.',
    taskDescription: 'Implement `token_bucket_allow(timestamps, capacity, refill_rate)`. The bucket starts with `capacity` tokens. Process `timestamps` in order: refill by `elapsed * refill_rate` tokens since the previous timestamp (capped at `capacity`, no refill before the first timestamp), then allow (and consume 1 token) if at least 1 token is available, otherwise deny. Return one bool per timestamp.',
    constraints: [
      'Must raise ValueError if capacity <= 0.',
      'Must raise ValueError if any timestamp is earlier than the previous one.',
      'Tokens never exceed `capacity`, even after a long gap.',
      'A request that is allowed consumes exactly 1 token.',
    ],
    hints: {
      small: 'Track `tokens` (starts at `capacity`) and `last_t` (starts as `None`). On each timestamp, if `last_t` is not `None`, add `(t - last_t) * refill_rate` to `tokens`, capped at `capacity`.',
      strong: 'After refilling, check `if tokens >= 1: tokens -= 1; allow = True` else `allow = False` -- update `last_t = t` every iteration regardless of the outcome, including the very first one.',
      concept: 'This is the same rate-limiting shape behind `Retry-After` / 429 responses in real APIs -- capacity absorbs a legitimate burst, refill_rate caps sustained throughput, and the two together are strictly more forgiving to bursty legitimate traffic than a fixed request-per-window counter.',
    },
    conceptConnections: [
      { title: 'Networking & Distributed Systems', route: '/docs/cs-fundamentals/networking-and-distributed-systems', description: 'Rate limiting as a core distributed-systems reliability pattern' },
    ],
    testCases: [
      { id: 'burst-then-deny', label: 'Burst Exhausts Capacity', input: { timestamps: [0, 0, 0, 0], capacity: 3, refill_rate: 1 }, expectedOutput: [true, true, true, false], hidden: false, description: '3 requests at the same instant drain the bucket; the 4th is denied' },
      { id: 'refill-over-time', label: 'Refill Keeps Up With Spaced Requests', input: { timestamps: [0, 0.5, 1.0, 10.0], capacity: 2, refill_rate: 1 }, expectedOutput: [true, true, true, true], hidden: false, description: 'Each gap refills enough tokens before the next request arrives' },
      { id: 'zero-capacity', label: 'Non-Positive Capacity', input: { timestamps: [1], capacity: 0, refill_rate: 1 }, expectError: 'ValueError', hidden: true },
      { id: 'out-of-order', label: 'Decreasing Timestamps', input: { timestamps: [5, 3], capacity: 2, refill_rate: 1 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-6': {
    id: 'agents-mcp-systems-prob-6',
    title: 'Filtered Vector Search With a Metadata Tag',
    difficulty: 'easy',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'filtered_vector_search',
    functionSignature: 'filtered_vector_search(query: list[float], vectors: list[list[float]], tags: list[str], required_tag: str, k: int) -> list[int]',
    starterCode: `import math

def filtered_vector_search(query, vectors, tags, required_tag, k):
    """Restrict the candidate set to vectors[i] where tags[i] ==
    required_tag, then return the indices (into the ORIGINAL vectors
    list) of the k most similar candidates to query by cosine similarity,
    sorted most-similar first (ties broken by lower index). Raise
    ValueError if k <= 0, if k exceeds the number of matching candidates,
    or if query or a matching candidate has zero magnitude."""
    # Your implementation here
    pass
`,
    mission: 'Implement filtered vector search -- the metadata-pre-filter-plus-similarity-search pattern every real vector database (Pinecone, Weaviate, Qdrant) offers, since "find me the most similar PUBLISHED articles by THIS author" is a far more common real query than pure unfiltered similarity search.',
    taskDescription: 'Implement `filtered_vector_search(query, vectors, tags, required_tag, k)`. First restrict to indices where `tags[i] == required_tag`. Among only those candidates, compute cosine similarity to `query` and return the `k` most similar candidate indices (indices into the original `vectors` list), sorted descending by similarity, ties broken by the lower original index.',
    constraints: [
      'Must raise ValueError if k <= 0.',
      'Must raise ValueError if k exceeds the number of candidates matching required_tag (not the total vector count).',
      'Must raise ValueError if `query` or any matching candidate has zero magnitude.',
      'Returned indices are positions in the ORIGINAL `vectors` list, not positions within the filtered subset.',
    ],
    hints: {
      small: 'First build the candidate index list: `[i for i, t in enumerate(tags) if t == required_tag]`.',
      strong: 'Compute `(i, cosine_similarity(query, vectors[i]))` only for `i` in that candidate list, sort by `(-similarity, i)`, then take the first k -- the indices are already the correct original-list positions since you never re-indexed the filtered subset.',
      concept: 'A real vector index applies the metadata filter BEFORE (or interleaved with) the similarity search, not after truncating to k -- filtering after truncation could return fewer than k results even when enough matching candidates exist, exactly the bug this problem\'s "k exceeds matching candidates" check guards against.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'Metadata-filtered similarity search is a standard feature of every production vector database' },
    ],
    testCases: [
      {
        id: 'basic',
        label: 'Top 2 Among Tag "a"',
        input: { query: [1, 0], vectors: [[1, 0], [0, 1], [1, 1], [-1, 0], [0.9, 0.1]], tags: ['a', 'b', 'a', 'a', 'b'], required_tag: 'a', k: 2 },
        expectedOutput: [0, 2],
        hidden: false,
        description: 'Candidates are indices 0, 2, 3 (tag "a"); index 1 and 4 (tag "b") are excluded entirely',
      },
      {
        id: 'all-candidates',
        label: 'k Equals Candidate Count',
        input: { query: [1, 0], vectors: [[1, 0], [0, 1], [1, 1], [-1, 0], [0.9, 0.1]], tags: ['a', 'b', 'a', 'a', 'b'], required_tag: 'a', k: 3 },
        expectedOutput: [0, 2, 3],
        hidden: false,
      },
      {
        id: 'k-exceeds-candidates',
        label: 'k Exceeds Matching Candidates',
        input: { query: [1, 0], vectors: [[1, 0], [0, 1], [1, 1], [-1, 0], [0.9, 0.1]], tags: ['a', 'b', 'a', 'a', 'b'], required_tag: 'a', k: 4 },
        expectError: 'ValueError',
        hidden: true,
        description: 'Only 3 vectors match tag "a", even though the total vector count is 5',
      },
      {
        id: 'no-matches',
        label: 'No Vectors Match the Tag',
        input: { query: [1, 0], vectors: [[1, 0], [0, 1]], tags: ['a', 'b'], required_tag: 'zzz', k: 1 },
        expectError: 'ValueError',
        hidden: true,
      },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-7': {
    id: 'agents-mcp-systems-prob-7',
    title: 'Patchify an Image for a Vision Transformer',
    difficulty: 'easy',
    topic: 'Multimodal AI',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'patchify',
    functionSignature: 'patchify(image: list[list[float]], patch_size: int) -> list[list[list[float]]]',
    starterCode: `def patchify(image, patch_size):
    """Split a 2D image (list of rows) into non-overlapping
    patch_size x patch_size square patches, scanning row-major (left to
    right, then top to bottom). Raise ValueError if patch_size <= 0 or if
    the image's height or width is not evenly divisible by patch_size."""
    # Your implementation here
    pass
`,
    mission: 'Implement the exact patch-splitting step a Vision Transformer (ViT) runs before anything else -- turning a 2D image into the sequence of fixed-size patches that get linearly embedded into "visual tokens", the same way a tokenizer turns text into tokens.',
    taskDescription: 'Implement `patchify(image, patch_size)`. `image` is a list of equal-length rows. Return a list of `patch_size x patch_size` patches (each a list of rows), scanning patches row-major: left-to-right across a row of patches, then down to the next row of patches.',
    constraints: [
      'Must raise ValueError if patch_size <= 0.',
      "Must raise ValueError if the image's height or width is not evenly divisible by patch_size.",
      'Patches are emitted row-major: all patches in the top patch-row first (left to right), then the next patch-row.',
    ],
    hints: {
      small: 'Loop `r` over `range(0, height, patch_size)` and, inside that, `c` over `range(0, width, patch_size)`.',
      strong: 'For each `(r, c)`, the patch is `[row[c:c+patch_size] for row in image[r:r+patch_size]]` -- slice the rows first, then slice columns within each of those rows.',
      concept: 'ViT treats an image as a sequence the same way a Transformer treats text -- each fixed-size patch becomes one "token" via a linear projection, so patchify is literally the image-domain equivalent of tokenization.',
    },
    conceptConnections: [
      { title: 'Modern Vision & Multimodal Models', route: '/docs/computer-vision/modern-vision-and-multimodal', description: 'Patch embedding is the first layer of every Vision Transformer' },
    ],
    testCases: [
      {
        id: 'basic-4x4',
        label: '4x4 Image, 2x2 Patches',
        input: { image: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], patch_size: 2 },
        expectedOutput: [[[1, 2], [5, 6]], [[3, 4], [7, 8]], [[9, 10], [13, 14]], [[11, 12], [15, 16]]],
        hidden: false,
      },
      { id: 'unit-patches', label: '1x1 Patches', input: { image: [[1, 2], [3, 4]], patch_size: 1 }, expectedOutput: [[[1]], [[2]], [[3]], [[4]]], hidden: false },
      { id: 'not-divisible', label: 'Dimensions Not Divisible by patch_size', input: { image: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], patch_size: 2 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-8': {
    id: 'agents-mcp-systems-prob-8',
    title: 'Assemble RAG Context Within a Token Budget',
    difficulty: 'medium',
    topic: 'Retrieval-Augmented Generation',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'assemble_context_within_budget',
    functionSignature: 'assemble_context_within_budget(token_counts: list[int], max_tokens: int) -> list[int]',
    starterCode: `def assemble_context_within_budget(token_counts, max_tokens):
    """token_counts[i] is the token count of the i-th retrieved chunk,
    already ranked best-first. Greedily include chunks in rank order
    while the running total stays within max_tokens, and STOP (do not
    skip ahead to a smaller later chunk) at the first chunk that would
    exceed the budget. Return the included chunks' original indices, in
    order. Raise ValueError if max_tokens <= 0."""
    # Your implementation here
    pass
`,
    mission: 'Implement the greedy token-budget packer that decides how many of a RAG pipeline\'s ranked, retrieved chunks actually fit into the LLM\'s finite context window -- the real, mundane step between "we retrieved 20 relevant chunks" and "here is the prompt we can actually send."',
    taskDescription: 'Implement `assemble_context_within_budget(token_counts, max_tokens)`. Walk `token_counts` in rank order (best chunk first), adding each chunk\'s token count to a running total. Stop entirely at the first chunk that would push the running total over `max_tokens` -- do not skip it and keep checking later, smaller chunks. Return the indices of the included chunks, in their original order.',
    constraints: [
      'Must raise ValueError if max_tokens <= 0.',
      'Stop at the FIRST chunk that would exceed the budget -- never skip a chunk to fit a later, smaller one (that would break the retrieval\'s relevance ranking).',
      'An empty `token_counts` list returns an empty list.',
      'A chunk exactly filling the remaining budget (running total after it equals max_tokens) is included.',
    ],
    hints: {
      small: 'Track a running `used` total starting at 0. For each chunk in order, check whether `used + token_counts[i] > max_tokens` before adding it.',
      strong: 'The moment a chunk would exceed the budget, `break` out of the loop immediately -- do not `continue` to check whether a later, smaller chunk might still fit, since that would reorder which chunks get included relative to the retriever\'s own relevance ranking.',
      concept: 'This is deliberately NOT a knapsack optimization (which would maximize chunks packed in, possibly reordering by size) -- a RAG context window has to preserve the retriever\'s relevance order, so a smaller-but-lower-ranked chunk must never bump a larger-but-higher-ranked one out of the prompt.',
    },
    conceptConnections: [
      { title: 'Retrieval-Augmented Generation', route: '/docs/llms-genai/rag', description: 'Fitting retrieved chunks into a finite context window is a real constraint of every RAG pipeline' },
    ],
    testCases: [
      { id: 'basic', label: 'Third Chunk Breaks the Budget', input: { token_counts: [100, 150, 80, 200], max_tokens: 300 }, expectedOutput: [0, 1], hidden: false, description: '100 + 150 = 250; adding 80 more would make 330 > 300, so it stops there' },
      { id: 'all-fit', label: 'Every Chunk Fits', input: { token_counts: [50, 50, 50], max_tokens: 1000 }, expectedOutput: [0, 1, 2], hidden: false },
      { id: 'first-too-big', label: 'Even the First Chunk Does Not Fit', input: { token_counts: [500], max_tokens: 100 }, expectedOutput: [], hidden: false },
      { id: 'exact-fit', label: 'Exact Budget Fit', input: { token_counts: [100, 100, 100], max_tokens: 300 }, expectedOutput: [0, 1, 2], hidden: true, description: 'Running total after all three is exactly 300, which is allowed' },
      { id: 'bad-budget', label: 'Non-Positive Budget', input: { token_counts: [1, 2, 3], max_tokens: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-9': {
    id: 'agents-mcp-systems-prob-9',
    title: 'Detect a Repeating Agent Tool-Call Loop',
    difficulty: 'medium',
    topic: 'Agent Orchestration',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'detect_agent_loop',
    functionSignature: 'detect_agent_loop(calls: list[tuple[str, str]], max_repeats: int) -> bool',
    starterCode: `def detect_agent_loop(calls, max_repeats):
    """calls is an ordered list of (tool_name, arg) pairs an agent has
    called so far. Return True if the SAME (tool_name, arg) pair occurs
    max_repeats or more times CONSECUTIVELY anywhere in calls, else False.
    Raise ValueError if max_repeats < 1."""
    # Your implementation here
    pass
`,
    mission: 'Implement the loop-guard that stops an agent from silently burning its whole tool-call budget retrying the exact same failing action forever -- a real, common agent failure mode, not a hypothetical one.',
    taskDescription: 'Implement `detect_agent_loop(calls, max_repeats)`. Return `True` if the identical `(tool_name, arg)` pair appears `max_repeats` or more times in a row anywhere in `calls`, else `False`. An empty `calls` list returns `False`.',
    constraints: [
      'Must raise ValueError if max_repeats < 1.',
      'Only CONSECUTIVE repeats count -- the same call reappearing later after a different call in between does not accumulate with earlier occurrences.',
      'An empty `calls` list returns False, not an error.',
    ],
    hints: {
      small: 'Track the current run\'s value and its length as you scan left to right; reset the run whenever the call changes.',
      strong: 'Increment `run_len` when `calls[i] == run_value`; return True as soon as `run_len >= max_repeats`. On a mismatch, reset `run_value = calls[i]` and `run_len = 1`.',
      concept: 'This is a simple consecutive-run scan (the same shape as run-length encoding) -- deliberately consecutive-only, since an agent legitimately re-trying the same tool call after doing something else in between is normal, but 3+ IDENTICAL calls in a row with no new information is the real signal something is stuck.',
    },
    conceptConnections: [
      { title: 'Reflection & Self-Critique', route: '/docs/agents/reflection-self-critique', description: 'Loop detection is a real guardrail an agent runtime needs alongside self-critique' },
    ],
    testCases: [
      { id: 'exact-repeat', label: 'Exactly max_repeats Consecutive Calls', input: { calls: [['search', 'x'], ['search', 'x'], ['search', 'x']], max_repeats: 3 }, expectedOutput: true, hidden: false },
      { id: 'below-threshold', label: 'Below the Threshold', input: { calls: [['search', 'x'], ['search', 'x']], max_repeats: 3 }, expectedOutput: false, hidden: false },
      { id: 'interrupted-then-repeat', label: 'Different Call Resets the Run', input: { calls: [['search', 'x'], ['calc', 'y'], ['search', 'x'], ['search', 'x']], max_repeats: 2 }, expectedOutput: true, hidden: false, description: 'The trailing 2 identical calls are what trips max_repeats=2, not the earlier isolated one' },
      { id: 'empty-calls', label: 'No Calls Yet', input: { calls: [], max_repeats: 2 }, expectedOutput: false, hidden: true },
      { id: 'invalid-max-repeats', label: 'max_repeats Below 1', input: { calls: [['a', 'b']], max_repeats: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-10': {
    id: 'agents-mcp-systems-prob-10',
    title: 'Correlate JSON-RPC Responses to Requests',
    difficulty: 'medium',
    topic: 'Model Context Protocol',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'correlate_jsonrpc_responses',
    functionSignature: 'correlate_jsonrpc_responses(requests: list[dict], responses: list[dict]) -> list[dict]',
    starterCode: `def correlate_jsonrpc_responses(requests, responses):
    """requests is a list of {"id": ..., "method": str}, in the order they
    were sent. responses is a list of {"id": ..., "result": Any} or
    {"id": ..., "error": str}, possibly arriving out of order. Return a
    list, in REQUEST order, of {"method": str, "result": Any} or
    {"method": str, "error": str}. Raise ValueError if a request's id has
    no matching response, or a response has neither "result" nor "error"."""
    # Your implementation here
    pass
`,
    mission: 'Implement the request/response correlation every MCP client needs, since JSON-RPC 2.0 (the wire protocol MCP is built on) lets responses arrive in a different order than the requests were sent -- the client has to match them back up by id, not by arrival order.',
    taskDescription: 'Implement `correlate_jsonrpc_responses(requests, responses)`. Build an id -> outcome map from `responses` (each has `"result"` or `"error"`), then return one entry per request IN REQUEST ORDER: `{"method": ..., "result": ...}` or `{"method": ..., "error": ...}`. Raise `ValueError` if any request has no matching response, or if a response has neither key.',
    constraints: [
      'Output preserves the ORDER of `requests`, regardless of the order `responses` arrived in.',
      'Must raise ValueError if a request id has no corresponding entry in `responses`.',
      'Must raise ValueError if a response has neither "result" nor "error".',
      'Each output entry has exactly two keys: "method" plus either "result" or "error".',
    ],
    hints: {
      small: 'First build a dict from `responses`, keyed by id, storing whichever of result/error each one has.',
      strong: 'Then do a second pass over `requests` in order, looking up each request\'s id in that dict and raising immediately if it is missing.',
      concept: 'JSON-RPC 2.0 is explicitly async-friendly: nothing requires a server to answer requests in the order it received them, so id-based correlation (not arrival order) is the only correct way to match a response back to the request that produced it -- this is exactly the plumbing underneath every MCP client\'s tool-call/response round trip.',
    },
    conceptConnections: [
      { title: 'MCP Protocol Deep Dive', route: '/docs/agents/mcp/protocol-deep-dive', description: 'JSON-RPC 2.0 request/response correlation is the wire-level mechanism MCP tool calls use' },
    ],
    testCases: [
      {
        id: 'out-of-order',
        label: 'Responses Arrive Out of Order',
        input: {
          requests: [{ id: 1, method: 'search' }, { id: 2, method: 'calc' }],
          responses: [{ id: 2, result: 42 }, { id: 1, result: 'ok' }],
        },
        expectedOutput: [{ method: 'search', result: 'ok' }, { method: 'calc', result: 42 }],
        hidden: false,
      },
      {
        id: 'error-response',
        label: 'A Response Carries an Error',
        input: { requests: [{ id: 1, method: 'search' }], responses: [{ id: 1, error: 'timeout' }] },
        expectedOutput: [{ method: 'search', error: 'timeout' }],
        hidden: false,
      },
      {
        id: 'missing-response',
        label: 'No Response for a Request',
        input: { requests: [{ id: 1, method: 'search' }], responses: [] },
        expectError: 'ValueError',
        hidden: true,
      },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-11': {
    id: 'agents-mcp-systems-prob-11',
    title: 'Deterministic Canary Rollout Router',
    difficulty: 'medium',
    topic: 'MLOps & Deployment',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'route_canary',
    functionSignature: 'route_canary(request_id: str, canary_percentage: float) -> str',
    starterCode: `import hashlib

def route_canary(request_id, canary_percentage):
    """Deterministically route a request to "canary" or "stable" so the
    SAME request_id always gets the SAME answer for a given
    canary_percentage. Use an MD5-hash-based bucket in [0, 100): hash
    request_id, take the hash integer mod 100 as the bucket, and route to
    "canary" if bucket < canary_percentage else "stable". Raise ValueError
    if canary_percentage is not in [0, 100]."""
    # Your implementation here
    pass
`,
    mission: 'Implement the deterministic hash-based routing a canary/blue-green rollout uses to decide which model or service version a given request sees -- the same request_id (e.g. a user or session id) must land on the same side of the split every time, or a user would flicker between old and new behavior mid-session.',
    taskDescription: 'Implement `route_canary(request_id, canary_percentage)`. Hash `request_id` with MD5, take `int(hexdigest, 16) % 100` as a stable bucket, and return `"canary"` if `bucket < canary_percentage` else `"stable"`. Raise `ValueError` if `canary_percentage` is outside `[0, 100]`.',
    constraints: [
      'Must raise ValueError if canary_percentage < 0 or canary_percentage > 100.',
      'The same request_id and canary_percentage must always produce the same result (no randomness).',
      'canary_percentage = 0 always returns "stable"; canary_percentage = 100 always returns "canary".',
    ],
    hints: {
      small: 'Use `hashlib.md5(request_id.encode()).hexdigest()`, then `int(digest, 16) % 100` for a bucket in [0, 100).',
      strong: 'The comparison is `bucket < canary_percentage`, not `<=` -- that\'s what makes canary_percentage=0 route everything to stable and canary_percentage=100 route everything to canary.',
      concept: 'Hashing the identity into a bucket (instead of `random.random() < p`) is what makes the split STICKY -- the same user keeps hitting the same variant on every request, which is required for any rollout that has session-visible behavior differences.',
    },
    conceptConnections: [
      { title: 'Deployment Strategies', route: '/docs/mlops/deployment-strategies', description: 'Canary rollouts are one of the core deployment strategies for shipping a new model safely' },
    ],
    testCases: [
      { id: 'stable', label: 'Routes to Stable', input: { request_id: 'user-1001', canary_percentage: 50 }, expectedOutput: 'stable', hidden: false, description: 'md5("user-1001") mod 100 = 75, which is not < 50' },
      { id: 'canary', label: 'Routes to Canary', input: { request_id: 'user-1002', canary_percentage: 50 }, expectedOutput: 'canary', hidden: false, description: 'md5("user-1002") mod 100 = 35, which is < 50' },
      { id: 'zero-percent', label: 'Zero Percent Always Stable', input: { request_id: 'user-1001', canary_percentage: 0 }, expectedOutput: 'stable', hidden: false },
      { id: 'hundred-percent', label: 'Hundred Percent Always Canary', input: { request_id: 'user-1001', canary_percentage: 100 }, expectedOutput: 'canary', hidden: true },
      { id: 'out-of-range', label: 'Percentage Out of Range', input: { request_id: 'user-1001', canary_percentage: 150 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-12': {
    id: 'agents-mcp-systems-prob-12',
    title: 'Consistent Hashing Ring Lookup',
    difficulty: 'hard',
    topic: 'Distributed Systems',
    estimatedTime: '25–30 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'consistent_hash_lookup',
    functionSignature: 'consistent_hash_lookup(nodes: list[str], key: str, replicas: int) -> str',
    starterCode: `import hashlib

def _hash(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16) % (2**32)

def consistent_hash_lookup(nodes, key, replicas):
    """Build a consistent-hashing ring: each node gets 'replicas' virtual
    points on the ring at hash(f"{node}#{i}") for i in range(replicas).
    Look up 'key' by hashing it and returning the owning node -- the node
    of the first ring point at or after hash(key), wrapping around to the
    smallest ring point if hash(key) is past every point. Raise ValueError
    if nodes is empty or replicas < 1."""
    # Your implementation here
    pass
`,
    mission: 'Implement consistent hashing, the algorithm real distributed caches and sharded databases (DynamoDB, Cassandra, memcached clients) use to map keys to nodes so that adding or removing ONE node only reshuffles a small fraction of keys, instead of remapping everything the way `hash(key) % num_nodes` would.',
    taskDescription: 'Implement `consistent_hash_lookup(nodes, key, replicas)`. Build a ring of `len(nodes) * replicas` virtual points, each node contributing points at `hash(f"{node}#{i}")` for `i in range(replicas)`. To look up `key`, hash it and walk clockwise around the sorted ring to the first point at or after that hash, returning its node (wrapping to the smallest point if none is at or after it).',
    constraints: [
      'Must raise ValueError if `nodes` is empty.',
      'Must raise ValueError if `replicas` < 1.',
      'The lookup for a given key must be deterministic (the same key always maps to the same node for the same nodes/replicas).',
      'Use the exact hash scheme in the starter code (`md5` of the string, interpreted as an integer, mod 2**32) so results are reproducible.',
    ],
    hints: {
      small: 'Build the ring as a list of `(hash_value, node)` pairs, one per virtual replica, and sort it by hash_value.',
      strong: 'Hash the lookup key the same way, then scan the sorted ring for the first point whose hash is `>= target`; if you reach the end without finding one, wrap around and return the very first ring entry\'s node.',
      concept: 'Plain `hash(key) % num_nodes` remaps almost every key when num_nodes changes -- a full cache/shard invalidation. Consistent hashing instead places both nodes and keys on the same ring, so removing a node only reassigns the keys that were mapped to that node\'s arcs, not the whole keyspace; multiple virtual replicas per node exist to smooth out an uneven key distribution across the ring.',
    },
    conceptConnections: [
      { title: 'Networking & Distributed Systems', route: '/docs/cs-fundamentals/networking-and-distributed-systems', description: 'Consistent hashing is the standard sharding/routing scheme behind distributed caches and databases' },
    ],
    testCases: [
      { id: 'lookup-a', label: 'Key Maps to node-a', input: { nodes: ['node-a', 'node-b', 'node-c'], key: 'user-1', replicas: 3 }, expectedOutput: 'node-a', hidden: false },
      { id: 'lookup-b', label: 'Key Maps to node-b', input: { nodes: ['node-a', 'node-b', 'node-c'], key: 'user-3', replicas: 3 }, expectedOutput: 'node-b', hidden: false },
      { id: 'lookup-c', label: 'Key Maps to node-c', input: { nodes: ['node-a', 'node-b', 'node-c'], key: 'user-5', replicas: 3 }, expectedOutput: 'node-c', hidden: false, description: 'Different keys land on different nodes -- a stub that always returns the same node fails this' },
      { id: 'empty-nodes', label: 'No Nodes', input: { nodes: [], key: 'user-1', replicas: 3 }, expectError: 'ValueError', hidden: true },
      { id: 'zero-replicas', label: 'Zero Replicas', input: { nodes: ['node-a'], key: 'user-1', replicas: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-13': {
    id: 'agents-mcp-systems-prob-13',
    title: 'Hybrid Search Score Fusion',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'hybrid_search_score',
    functionSignature: 'hybrid_search_score(keyword_scores: dict[str, float], vector_scores: dict[str, float], alpha: float) -> dict[str, float]',
    starterCode: `def hybrid_search_score(keyword_scores, vector_scores, alpha):
    """Combine a keyword-search score map and a vector-similarity score
    map into one hybrid score per document: combined = alpha * vector +
    (1 - alpha) * keyword. A document missing from one map contributes 0
    for that side. Return a dict covering the union of both maps' keys.
    Raise ValueError if alpha is not in [0, 1]."""
    # Your implementation here
    pass
`,
    mission: 'Implement the linear score-fusion step a hybrid vector database (e.g. pgvector combined with Postgres full-text search, or Weaviate/Elasticsearch hybrid mode) uses to blend keyword relevance and semantic similarity into a single ranking, tunable by alpha between pure keyword and pure vector search.',
    taskDescription: 'Implement `hybrid_search_score(keyword_scores, vector_scores, alpha)`. For every document appearing in either map, compute `alpha * vector_scores.get(doc, 0.0) + (1 - alpha) * keyword_scores.get(doc, 0.0)`. Return a dict from document ID to combined score. Raise `ValueError` if `alpha` is outside `[0, 1]`.',
    constraints: [
      'Must raise ValueError if alpha < 0 or alpha > 1.',
      'The result covers the UNION of keys from both input maps.',
      'A document present in only one map is treated as score 0.0 on the other side.',
      'alpha = 1.0 reduces to pure vector scores; alpha = 0.0 reduces to pure keyword scores.',
    ],
    hints: {
      small: 'Build the key set with `set(keyword_scores) | set(vector_scores)`, then compute one weighted sum per key.',
      strong: 'Use `.get(doc, 0.0)` on both dicts so a document missing from either side contributes exactly 0 for that term, rather than a KeyError.',
      concept: 'Keyword (BM25-style) and vector similarity scores live on totally different, unnormalized scales -- alpha is a tunable knob a real search system exposes to shift weight toward exact-term matching (alpha near 0) or semantic/paraphrase matching (alpha near 1) without having to renormalize either score.',
    },
    conceptConnections: [
      { title: 'Retrieval & Reranking Architectures', route: '/docs/llms-genai/retrieval-and-reranking-architectures', description: 'Hybrid keyword+vector search and its score-fusion step' },
    ],
    testCases: [
      {
        id: 'balanced',
        label: 'Balanced Alpha With a Partial Overlap',
        input: { keyword_scores: { doc1: 0.8, doc2: 0.2 }, vector_scores: { doc1: 0.5, doc3: 0.9 }, alpha: 0.5 },
        expectedOutput: { doc1: 0.65, doc2: 0.1, doc3: 0.45 },
        hidden: false,
      },
      {
        id: 'pure-vector',
        label: 'Alpha 1.0 Is Pure Vector',
        input: { keyword_scores: { doc1: 0.8, doc2: 0.2 }, vector_scores: { doc1: 0.5, doc3: 0.9 }, alpha: 1.0 },
        expectedOutput: { doc1: 0.5, doc2: 0.0, doc3: 0.9 },
        hidden: false,
      },
      {
        id: 'pure-keyword',
        label: 'Alpha 0.0 Is Pure Keyword',
        input: { keyword_scores: { doc1: 0.8, doc2: 0.2 }, vector_scores: { doc1: 0.5, doc3: 0.9 }, alpha: 0.0 },
        expectedOutput: { doc1: 0.8, doc2: 0.2, doc3: 0.0 },
        hidden: true,
      },
      { id: 'bad-alpha', label: 'Alpha Out of Range', input: { keyword_scores: {}, vector_scores: {}, alpha: 1.5 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-14': {
    id: 'agents-mcp-systems-prob-14',
    title: 'CLIP-Style Zero-Shot Classification',
    difficulty: 'medium',
    topic: 'Multimodal AI',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'clip_zero_shot_predict',
    functionSignature: 'clip_zero_shot_predict(image_embedding: list[float], label_embeddings: list[list[float]], temperature: float) -> list[float]',
    starterCode: `import math

def clip_zero_shot_predict(image_embedding, label_embeddings, temperature):
    """CLIP-style zero-shot classification: compute cosine similarity
    between image_embedding and each vector in label_embeddings, divide
    each by temperature, then return the softmax over those scaled
    similarities as a list of probabilities (one per label, summing to
    1.0). Raise ValueError if label_embeddings is empty or temperature
    <= 0."""
    # Your implementation here
    pass
`,
    mission: 'Implement the exact scoring step behind CLIP zero-shot image classification: no classifier head is trained at all -- an image is classified by comparing its embedding against a set of TEXT label embeddings ("a photo of a cat", "a photo of a dog", ...) and taking a temperature-scaled softmax over the similarities.',
    taskDescription: 'Implement `clip_zero_shot_predict(image_embedding, label_embeddings, temperature)`. For each label embedding, compute cosine similarity to `image_embedding`, divide by `temperature`, then apply softmax across all labels\' scaled similarities. Return the resulting probabilities (summing to 1.0), one per label in the same order as `label_embeddings`.',
    constraints: [
      'Must raise ValueError if `label_embeddings` is empty.',
      'Must raise ValueError if `temperature` <= 0.',
      'Subtract the max scaled similarity before exponentiating (numerically stable softmax).',
      'Output length equals `len(label_embeddings)` and its values sum to 1.0.',
    ],
    hints: {
      small: 'First compute one cosine similarity per label embedding, then divide every one by `temperature`.',
      strong: 'Numerically-stable softmax: subtract the max scaled score before `math.exp`, sum the exponentials, then divide each by that sum.',
      concept: 'A LOWER temperature sharpens the distribution toward the single best-matching label (more confident, more decisive); a HIGHER temperature flattens it toward uniform -- this is the same temperature-scaling knob used in LLM sampling, applied here to a similarity-based classifier instead of next-token logits.',
    },
    conceptConnections: [
      { title: 'Modern Vision & Multimodal Models', route: '/docs/computer-vision/modern-vision-and-multimodal', description: 'CLIP-style contrastive image-text embeddings are the basis of zero-shot multimodal classification' },
    ],
    testCases: [
      {
        id: 'two-labels-orthogonal',
        label: 'Two Orthogonal Labels',
        input: { image_embedding: [1, 0], label_embeddings: [[1, 0], [0, 1]], temperature: 1.0 },
        expectedOutput: [0.7310585786300049, 0.2689414213699951],
        hidden: false,
        description: 'The matching label (cosine sim 1.0) gets most of the probability mass',
      },
      {
        id: 'three-labels-low-temp',
        label: 'Three Labels, Lower Temperature',
        input: { image_embedding: [1, 0], label_embeddings: [[1, 0], [0, 1], [1, 1]], temperature: 0.5 },
        expectedOutput: [0.5910154348001523, 0.07998524126588842, 0.3289993239339593],
        hidden: false,
      },
      { id: 'empty-labels', label: 'No Label Embeddings', input: { image_embedding: [1, 0], label_embeddings: [], temperature: 1.0 }, expectError: 'ValueError', hidden: true },
      { id: 'bad-temperature', label: 'Non-Positive Temperature', input: { image_embedding: [1, 0], label_embeddings: [[1, 0]], temperature: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-15': {
    id: 'agents-mcp-systems-prob-15',
    title: 'Recall@K for RAG Retrieval Evaluation',
    difficulty: 'easy',
    topic: 'Retrieval-Augmented Generation',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'retrieval_recall_at_k',
    functionSignature: 'retrieval_recall_at_k(retrieved: list[str], relevant: list[str], k: int) -> float',
    starterCode: `def retrieval_recall_at_k(retrieved, relevant, k):
    """retrieved is a ranked list of document IDs (best first). relevant
    is the list of document IDs that are actually correct for the query.
    Return recall@k: the fraction of 'relevant' documents that appear
    among the top k of 'retrieved'. Raise ValueError if k <= 0 or if
    relevant is empty."""
    # Your implementation here
    pass
`,
    mission: 'Implement Recall@K, the standard metric for asking "did the retriever actually surface the documents that matter?" -- the metric a RAG pipeline is evaluated on before ever touching generation quality, since a perfect LLM answer is impossible if the right chunk was never retrieved.',
    taskDescription: 'Implement `retrieval_recall_at_k(retrieved, relevant, k)`. Take the top `k` entries of `retrieved`, and return `|top_k ∩ relevant| / |relevant|` as a float. Raise `ValueError` if `k <= 0` or `relevant` is empty.',
    constraints: [
      'Must raise ValueError if k <= 0.',
      'Must raise ValueError if relevant is empty (recall is undefined with no relevant documents).',
      'Only the first k entries of retrieved count, even if retrieved is longer.',
      'The denominator is always len(relevant), regardless of how many were retrieved.',
    ],
    hints: {
      small: 'Slice `retrieved[:k]`, then count how many of those IDs are also in `relevant`.',
      strong: 'Convert both the top-k slice and `relevant` to sets and intersect them for the hit count, then divide by `len(relevant)`.',
      concept: 'Recall@K only asks whether the relevant documents were SOMEWHERE in the top k -- it says nothing about their exact rank order within those k, which is what a separate metric like MRR or nDCG@K captures instead.',
    },
    conceptConnections: [
      { title: 'Retrieval-Augmented Generation', route: '/docs/llms-genai/rag', description: 'Recall@K is the standard retrieval-quality metric a RAG pipeline is evaluated on before generation' },
    ],
    testCases: [
      { id: 'partial-recall', label: 'Partial Recall at k=3', input: { retrieved: ['docA', 'docB', 'docC', 'docD'], relevant: ['docB', 'docD', 'docE'], k: 3 }, expectedOutput: 0.3333333333333333, hidden: false, description: 'Top 3 = [docA, docB, docC]; only docB of the 3 relevant docs is in there' },
      { id: 'better-recall', label: 'Larger k Recovers More', input: { retrieved: ['docA', 'docB', 'docC', 'docD'], relevant: ['docB', 'docD', 'docE'], k: 4 }, expectedOutput: 0.6666666666666666, hidden: false, description: 'Top 4 now also includes docD' },
      { id: 'zero-recall', label: 'No Overlap', input: { retrieved: ['docX'], relevant: ['docY'], k: 1 }, expectedOutput: 0.0, hidden: false },
      { id: 'bad-k', label: 'Non-Positive k', input: { retrieved: ['docA'], relevant: ['docB'], k: 0 }, expectError: 'ValueError', hidden: true },
      { id: 'empty-relevant', label: 'Empty Relevant Set', input: { retrieved: ['docA'], relevant: [], k: 1 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-1': {
    id: 'arr-hash-prob-1',
    title: 'Two Sum',
    difficulty: 'easy',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '10–15 min',
    functionName: 'two_sum',
    functionSignature: 'two_sum(nums: list[int], target: int) -> list[int]',
    starterCode: `def two_sum(nums, target):
    """Return the indices [i, j] (i < j) of the two numbers in nums that
    add up to target. Assume exactly one valid pair exists and you may
    not use the same element twice. Raise ValueError if no pair sums to
    target."""
    # Your implementation here
    pass
`,
    mission: 'Implement Two Sum with a single-pass hash map -- O(n) instead of the O(n^2) brute-force nested loop, and the canonical first problem that teaches "trade memory for time" via hashing.',
    taskDescription: 'Implement `two_sum(nums, target)`: for each number, check whether its complement (target - number) has already been seen; if so, return the pair of indices. Otherwise record the current number and its index and keep scanning.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Exactly one valid pair exists per input, and the same element may not be used twice.',
      'Return indices as [i, j] with i < j.',
      'Raise ValueError if no valid pair exists (defensive -- the stated inputs always have one).',
    ],
    hints: {
      small: 'For each number, ask "have I already seen the number that would complete this pair?" before adding the current number to what you have seen.',
      strong: 'seen = {}; for i, x in enumerate(nums): if target - x in seen: return [seen[target - x], i]; seen[x] = i.',
      concept: 'Checking the complement BEFORE inserting the current number is what makes a single pass enough -- inserting first would make an element pair with itself when 2*x == target.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Hash-map lookups as the standard O(n) alternative to nested-loop search' },
    ],
    testCases: [
      { id: 'basic', label: 'Basic Pair', input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], hidden: false },
      { id: 'later-pair', label: 'Answer Not at the Start', input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], hidden: false },
      { id: 'duplicate-values', label: 'Duplicate Values Sum to Target', input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], hidden: true },
      { id: 'negative-numbers', label: 'Negative Numbers', input: { nums: [-3, 4, 3, 90], target: 0 }, expectedOutput: [0, 2], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-2': {
    id: 'arr-hash-prob-2',
    title: 'Contains Duplicate',
    difficulty: 'easy',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '10–15 min',
    functionName: 'contains_duplicate',
    functionSignature: 'contains_duplicate(nums: list[int]) -> bool',
    starterCode: `def contains_duplicate(nums):
    """Return True if any value appears at least twice in nums, False if
    every element is distinct."""
    # Your implementation here
    pass
`,
    mission: 'Implement the simplest real use of a hash set: turning an O(n^2) "compare every pair" question into a single O(n) pass by tracking what has already been seen.',
    taskDescription: 'Implement `contains_duplicate(nums)`: track seen values in a set as you scan; return True the moment a value repeats (or compare the set size to the list length).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'An empty list has no duplicates -- return False.',
      'Must run in better than O(n^2) time (a hash set, not nested loops).',
    ],
    hints: {
      small: 'A Python set automatically drops duplicates -- compare its size to the original list length.',
      strong: 'return len(set(nums)) != len(nums).',
      concept: 'set membership checks and insertion are both O(1) average case, which is exactly what turns this from an O(n^2) all-pairs comparison into a single O(n) pass.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Hash sets as the standard O(n) tool for duplicate/membership questions' },
    ],
    testCases: [
      { id: 'has-duplicate', label: 'Contains a Duplicate', input: { nums: [1, 2, 3, 1] }, expectedOutput: true, hidden: false },
      { id: 'all-distinct', label: 'All Distinct', input: { nums: [1, 2, 3, 4] }, expectedOutput: false, hidden: false },
      { id: 'empty', label: 'Empty List', input: { nums: [] }, expectedOutput: false, hidden: true },
      { id: 'many-duplicates', label: 'Several Repeats', input: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] }, expectedOutput: true, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-3': {
    id: 'arr-hash-prob-3',
    title: 'Valid Anagram',
    difficulty: 'easy',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '10–15 min',
    functionName: 'is_anagram',
    functionSignature: 'is_anagram(s: str, t: str) -> bool',
    starterCode: `def is_anagram(s, t):
    """Return True if t is an anagram of s (same characters, same
    multiplicity, any order), False otherwise."""
    # Your implementation here
    pass
`,
    mission: 'Implement anagram detection via character-frequency counting -- the hash-map pattern for "do two collections have the exact same multiset of items?" that generalizes far beyond just letters.',
    taskDescription: 'Implement `is_anagram(s, t)`: if the lengths differ, they cannot be anagrams. Otherwise count each character in s, then decrement for each character in t; the strings are anagrams exactly when every count returns to zero.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (e.g. collections.Counter) are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Different-length strings can never be anagrams -- check that first.',
      'Case-sensitive: "Rat" and "art" are not treated as anagrams of each other.',
    ],
    hints: {
      small: 'Build a frequency count of every character in s, then walk through t decrementing that same count.',
      strong: 'If len(s) != len(t): return False. counts = {}; for c in s: counts[c] = counts.get(c,0)+1. For each c in t, decrement (and remove at 0); if a character in t is missing from counts, return False. At the end, return True only if every count is back to 0.',
      concept: 'This is the exact same "compare multisets via counting" pattern used for Group Anagrams -- once you have a per-character frequency map, exact anagram equality is just "do the two frequency maps match."',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Frequency-counting as the standard technique for multiset-equality questions' },
    ],
    testCases: [
      { id: 'is-anagram', label: 'Valid Anagram', input: { s: 'anagram', t: 'nagaram' }, expectedOutput: true, hidden: false },
      { id: 'not-anagram', label: 'Not an Anagram', input: { s: 'rat', t: 'car' }, expectedOutput: false, hidden: false },
      { id: 'different-lengths', label: 'Different Lengths', input: { s: 'a', t: 'ab' }, expectedOutput: false, hidden: true },
      { id: 'same-string', label: 'Identical Strings', input: { s: 'listen', t: 'listen' }, expectedOutput: true, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-4': {
    id: 'arr-hash-prob-4',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '10–15 min',
    functionName: 'max_profit',
    functionSignature: 'max_profit(prices: list[int]) -> int',
    starterCode: `def max_profit(prices):
    """prices[i] is the stock price on day i. Return the maximum profit
    from buying on one day and selling on a LATER day (0 if no profit is
    possible, e.g. prices only ever fall). Return 0 for an empty list."""
    # Your implementation here
    pass
`,
    mission: 'Implement the single-pass "track the minimum seen so far" pattern -- one linear scan replaces the O(n^2) check of every buy/sell day pair.',
    taskDescription: 'Implement `max_profit(prices)`: walk the prices once, tracking the lowest price seen so far and the best profit (current price minus that running minimum) seen so far.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'You must buy before you sell (a later day\'s price, never an earlier one).',
      'Return 0 (not a negative number) if no profitable transaction exists.',
      'Return 0 for an empty price list.',
    ],
    hints: {
      small: 'As you scan left to right, keep the lowest price seen so far -- the best possible sale on today\'s price is always today\'s price minus that running minimum.',
      strong: 'min_price = prices[0]; best = 0; for p in prices[1:]: best = max(best, p - min_price); min_price = min(min_price, p).',
      concept: 'This is a greedy, single-pass O(n) solution -- the key insight is that the best day to have bought, as of any given day, is always the minimum price seen up to (and including) the day before.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Single-pass running-minimum/maximum tracking as a core greedy array pattern' },
    ],
    testCases: [
      { id: 'basic', label: 'Clear Buy Low Sell High', input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, hidden: false, description: 'Buy at 1, sell at 6' },
      { id: 'always-falling', label: 'Prices Only Fall', input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, hidden: false },
      { id: 'buy-then-dip', label: 'Best Buy Comes After a Dip', input: { prices: [2, 4, 1] }, expectedOutput: 2, hidden: true },
      { id: 'empty', label: 'Empty Price List', input: { prices: [] }, expectedOutput: 0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-5': {
    id: 'arr-hash-prob-5',
    title: 'Move Zeroes',
    difficulty: 'easy',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '10–15 min',
    functionName: 'move_zeroes',
    functionSignature: 'move_zeroes(nums: list[int]) -> list[int]',
    starterCode: `def move_zeroes(nums):
    """Return a new list with every 0 moved to the end, while preserving
    the RELATIVE order of all the non-zero elements."""
    # Your implementation here
    pass
`,
    mission: 'Implement the two-pointer "write position" in-place-partition pattern -- the same technique behind partitioning steps in quicksort and the Dutch National Flag problem, applied to its simplest case.',
    taskDescription: 'Implement `move_zeroes(nums)`: walk through nums once, writing every non-zero value to the next available front position (a running write-index), then fill the remaining tail positions with zeros.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'The relative order of the non-zero elements must be preserved exactly.',
      'Return a new list (do not worry about literal in-place mutation of the input for grading purposes).',
    ],
    hints: {
      small: 'Keep a "write pointer" starting at index 0. Walk through the array once, and whenever you see a non-zero value, place it at the write pointer and advance it.',
      strong: 'insert_pos = 0; for x in nums: if x != 0: result[insert_pos] = x; insert_pos += 1. After the scan, fill every remaining index from insert_pos to the end with 0.',
      concept: 'This "stable partition via a write pointer" pattern generalizes to any "move all X to one side while preserving relative order of the rest" problem, not just zeros.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'The two-pointer write-index pattern for in-place array partitioning' },
    ],
    testCases: [
      { id: 'basic', label: 'Mixed Zeros and Values', input: { nums: [0, 1, 0, 3, 12] }, expectedOutput: [1, 3, 12, 0, 0], hidden: false },
      { id: 'all-zero', label: 'Single Zero', input: { nums: [0] }, expectedOutput: [0], hidden: false },
      { id: 'no-zeros', label: 'No Zeros At All', input: { nums: [1, 2, 3] }, expectedOutput: [1, 2, 3], hidden: true },
      { id: 'zeros-at-end', label: 'Zeros Already at the End', input: { nums: [5, 2, 0, 0] }, expectedOutput: [5, 2, 0, 0], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-11': {
    id: 'arr-hash-prob-11',
    title: 'Group Anagrams',
    difficulty: 'medium',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '15–20 min',
    functionName: 'group_anagrams',
    functionSignature: 'group_anagrams(words: list[str]) -> list[list[str]]',
    starterCode: `def group_anagrams(words):
    """Group words that are anagrams of each other. Return the groups
    sorted by their sorted-letters key in ascending alphabetical order;
    within each group, preserve the words' original relative order."""
    # Your implementation here
    pass
`,
    mission: 'Implement Group Anagrams -- using a canonical key (each word\'s own sorted letters) as a hash-map key is the general pattern for "bucket items by some derived signature," not just for anagrams.',
    taskDescription: 'Implement `group_anagrams(words)`: for each word, compute its sorted-letters key (e.g. "eat" -> "aet") and append it to that key\'s bucket in a dict. Return the buckets as a list of lists, sorted by key alphabetically.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Two words are anagrams exactly when their sorted-letters keys are identical.',
      'Within a group, preserve the words\' original relative order from the input.',
      'Return the groups themselves sorted by their key string in ascending alphabetical order, so the output is fully deterministic.',
    ],
    hints: {
      small: 'A word\'s own letters, sorted, is a canonical signature every one of its anagrams shares -- use that as a dict key.',
      strong: 'groups = {}; for w in words: key = "".join(sorted(w)); groups.setdefault(key, []).append(w). Return [groups[k] for k in sorted(groups)].',
      concept: 'Sorting a small string (a handful of letters) to derive a hashable canonical key is a general technique -- the same idea applies to grouping by "same set of characters," "same digit multiset," or any other order-independent equivalence.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Canonical-key hashing as the standard way to bucket items by a derived signature' },
    ],
    testCases: [
      { id: 'basic', label: 'Three Groups', input: { words: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }, expectedOutput: [['bat'], ['eat', 'tea', 'ate'], ['tan', 'nat']], hidden: false, description: 'Sorted-key order: "abt" < "aet" < "ant"' },
      { id: 'empty-string', label: 'Single Empty String', input: { words: [''] }, expectedOutput: [['']], hidden: false },
      { id: 'single-word', label: 'Single Word, No Anagrams', input: { words: ['a'] }, expectedOutput: [['a']], hidden: true },
      { id: 'two-clean-groups', label: 'Two Clean Groups', input: { words: ['abc', 'bca', 'cab', 'xyz', 'zyx'] }, expectedOutput: [['abc', 'bca', 'cab'], ['xyz', 'zyx']], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-12': {
    id: 'arr-hash-prob-12',
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '15–20 min',
    functionName: 'product_except_self',
    functionSignature: 'product_except_self(nums: list[int]) -> list[int]',
    starterCode: `def product_except_self(nums):
    """Return a list where result[i] is the product of every element in
    nums EXCEPT nums[i]. Must not use division, and must run in O(n)
    time (extra O(n) output space is fine; the classic follow-up asks
    for O(1) *extra* space beyond the output, but that isn't required
    here)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Product of Array Except Self via two passes (prefix products, then suffix products) -- the classic answer to "compute this without division," which also correctly handles zeros in the input.',
    taskDescription: 'Implement `product_except_self(nums)`: first pass left-to-right builds each position\'s product of everything BEFORE it; second pass right-to-left multiplies in the product of everything AFTER it.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Division is not allowed (a zero in the input would break a divide-by-total approach anyway).',
      'Must run in O(n) time.',
    ],
    hints: {
      small: 'result[i] should end up as (product of everything before i) times (product of everything after i) -- compute those two halves in two separate passes.',
      strong: 'result[i] = prefix product up to i (exclusive) in a left-to-right pass; then walk right-to-left multiplying result[i] by a running suffix product (exclusive of i).',
      concept: 'This handles zeros correctly for free: if exactly one element is 0, every OTHER position\'s result becomes 0 automatically (since its prefix or suffix product includes that zero), and the zero position itself gets the product of everything else -- no special-casing needed.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Prefix/suffix precomputation as a core no-division array technique' },
    ],
    testCases: [
      { id: 'basic', label: 'No Zeros', input: { nums: [1, 2, 3, 4] }, expectedOutput: [24, 12, 8, 6], hidden: false },
      { id: 'one-zero', label: 'Exactly One Zero', input: { nums: [-1, 1, 0, -3, 3] }, expectedOutput: [0, 0, 9, 0, 0], hidden: false },
      { id: 'two-elements', label: 'Two Elements', input: { nums: [3, 5] }, expectedOutput: [5, 3], hidden: true },
      { id: 'negatives', label: 'Negative Numbers', input: { nums: [-1, -2, -3] }, expectedOutput: [6, 3, 2], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-13': {
    id: 'arr-hash-prob-13',
    title: 'Longest Consecutive Sequence',
    difficulty: 'medium',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '15–20 min',
    functionName: 'longest_consecutive',
    functionSignature: 'longest_consecutive(nums: list[int]) -> int',
    starterCode: `def longest_consecutive(nums):
    """Return the length of the longest run of consecutive integers
    present in nums (in any order in the input). Must run in O(n) time
    (no sorting)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the O(n) hash-set solution to Longest Consecutive Sequence -- the classic case where sorting FEELS natural but is actually the wrong complexity, and a hash set achieves true O(n).',
    taskDescription: 'Implement `longest_consecutive(nums)`: put every number in a set; for each number that is the START of a run (i.e. number-1 is NOT in the set), count forward (number+1, number+2, ...) to find that run\'s length, and track the best.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Must run in O(n) time -- sorting first (O(n log n)) does not satisfy the intended solution, even though it would give a correct answer.',
      'An empty list has longest-consecutive length 0.',
    ],
    hints: {
      small: 'Only start counting a run from a number that is genuinely the START of it -- i.e. number - 1 is not present in the set. Every other number gets counted as part of exactly one run, starting from its run\'s true beginning.',
      strong: 'numset = set(nums); for x in numset: if x - 1 not in numset: length = 1; cur = x; while cur+1 in numset: cur += 1; length += 1; best = max(best, length).',
      concept: 'The "only start counting from a true run start" check is what keeps this O(n) overall -- without it, every element inside a long run would redundantly re-scan the whole run, degrading to O(n^2) in the worst case (e.g. one giant consecutive run).',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Hash-set membership checks as an O(n) alternative to sorting' },
    ],
    testCases: [
      { id: 'basic', label: 'Scattered Input', input: { nums: [100, 4, 200, 1, 3, 2] }, expectedOutput: 4, hidden: false, description: 'The run 1,2,3,4' },
      { id: 'with-duplicates', label: 'Longer Run With a Duplicate', input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] }, expectedOutput: 9, hidden: false, description: 'The run 0 through 8 (the duplicate 0 does not extend it further)' },
      { id: 'empty', label: 'Empty List', input: { nums: [] }, expectedOutput: 0, hidden: true },
      { id: 'no-consecutive', label: 'No Two Numbers Adjacent', input: { nums: [10, 20, 30] }, expectedOutput: 1, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-14': {
    id: 'arr-hash-prob-14',
    title: 'Container With Most Water',
    difficulty: 'medium',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '15–20 min',
    functionName: 'max_area',
    functionSignature: 'max_area(heights: list[int]) -> int',
    starterCode: `def max_area(heights):
    """heights[i] is the height of a vertical line at position i. Return
    the maximum area of water a pair of these lines (plus the x-axis
    between them) can contain: area = min(heights[i], heights[j]) *
    abs(i - j)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the greedy two-pointer solution to Container With Most Water -- the classic proof that checking every pair (O(n^2)) is unnecessary once you see WHY moving the shorter pointer is always the only move worth making.',
    taskDescription: 'Implement `max_area(heights)`: start with pointers at both ends. At each step, compute the area between them, then move whichever pointer points at the SHORTER line inward (moving the taller one can only ever decrease or maintain the width-limited-by-the-short-side area).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Area = min(heights[l], heights[r]) * (r - l) for pointers l < r.',
      'Must run in O(n) time (a single two-pointer pass, not all pairs).',
    ],
    hints: {
      small: 'Start with the widest possible container (both ends) and shrink inward -- but only ever move the pointer at the SHORTER line.',
      strong: 'l, r = 0, len(heights)-1; best = 0; while l < r: best = max(best, min(heights[l],heights[r])*(r-l)); if heights[l] < heights[r]: l += 1 else: r -= 1.',
      concept: 'Moving the taller pointer can never help: the area is capped by the SHORTER side, so keeping the taller line in place while shrinking the width only ever makes things worse or equal -- moving the shorter line is the only move that has any chance of finding a taller limiting height.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'The greedy two-pointer-from-both-ends pattern for array optimization problems' },
    ],
    testCases: [
      { id: 'basic', label: 'Classic Example', input: { heights: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expectedOutput: 49, hidden: false, description: 'Lines at height 8 and 7, width 7' },
      { id: 'two-elements', label: 'Two Elements Only', input: { heights: [1, 1] }, expectedOutput: 1, hidden: false },
      { id: 'increasing', label: 'Strictly Increasing Heights', input: { heights: [1, 2, 3, 4, 5] }, expectedOutput: 6, hidden: true, description: 'min(2,5)*3 = 6 beats the two end lines (min(1,5)*4 = 4)' },
      { id: 'all-equal', label: 'All Equal Heights', input: { heights: [4, 4, 4, 4] }, expectedOutput: 12, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-15': {
    id: 'arr-hash-prob-15',
    title: 'Subarray Sum Equals K',
    difficulty: 'medium',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '15–20 min',
    functionName: 'subarray_sum',
    functionSignature: 'subarray_sum(nums: list[int], k: int) -> int',
    starterCode: `def subarray_sum(nums, k):
    """Return the number of CONTIGUOUS subarrays of nums whose elements
    sum to exactly k. nums may contain negative numbers (so a sliding
    window alone does not work here -- use prefix sums)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Subarray Sum Equals K via the prefix-sum-plus-hash-map trick -- the technique that makes this solvable in O(n) even with negative numbers present, where a sliding window would fail.',
    taskDescription: 'Implement `subarray_sum(nums, k)`: track a running prefix sum and a hash map of "how many times has each prefix sum value occurred so far." A subarray ending at the current position sums to k exactly when (current prefix sum - k) has occurred before -- add that count to the running total.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'nums may contain negative numbers -- a sliding-window approach (which requires monotonic growth) is not valid here.',
      'Initialize the prefix-sum-count map with {0: 1} to correctly count subarrays that start at index 0.',
    ],
    hints: {
      small: 'A subarray from index i+1 to j sums to k exactly when prefixSum[j] - prefixSum[i] == k -- i.e. prefixSum[i] == prefixSum[j] - k.',
      strong: 'counts = {0: 1}; total = 0; result = 0; for x in nums: total += x; result += counts.get(total - k, 0); counts[total] = counts.get(total, 0) + 1.',
      concept: 'The {0: 1} initialization is what correctly counts a subarray starting at index 0 -- it represents "the empty prefix," so a subarray from the very start that happens to sum to k is found via prefixSum[j] - 0 == k.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Prefix sums combined with hash-map counting for subarray-sum questions' },
    ],
    testCases: [
      { id: 'basic', label: 'Two Matching Subarrays', input: { nums: [1, 1, 1], k: 2 }, expectedOutput: 2, hidden: false, description: '[1,1] at indices 0-1 and 1-2' },
      { id: 'mixed', label: 'Two Different-Length Matches', input: { nums: [1, 2, 3], k: 3 }, expectedOutput: 2, hidden: false, description: '[1,2] and [3]' },
      { id: 'with-negatives', label: 'Negative Numbers Present', input: { nums: [1, -1, 0], k: 0 }, expectedOutput: 3, hidden: true, description: '[1,-1], [0], and [1,-1,0]' },
      { id: 'no-match', label: 'No Subarray Matches', input: { nums: [1, 2, 3], k: 100 }, expectedOutput: 0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-16': {
    id: 'arr-hash-prob-16',
    title: 'Sort Colors (Dutch National Flag)',
    difficulty: 'medium',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '15–20 min',
    functionName: 'sort_colors',
    functionSignature: 'sort_colors(nums: list[int]) -> list[int]',
    starterCode: `def sort_colors(nums):
    """nums contains only the values 0, 1, and 2. Return them sorted
    (all 0s, then all 1s, then all 2s) in a SINGLE pass using the
    three-pointer Dutch National Flag partition (not a general sort)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Dijkstra\'s Dutch National Flag partition -- a single O(n) pass with three pointers (low/mid/high) that sorts a 3-valued array without ever calling a general sort or using counting-sort-style extra passes.',
    taskDescription: 'Implement `sort_colors(nums)`: maintain low/mid/high pointers. While mid <= high: if nums[mid] is 0, swap it to the low region and advance both low and mid; if it\'s 1, just advance mid; if it\'s 2, swap it to the high region and shrink high (without advancing mid, since the swapped-in value at mid is still unexamined).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Input values are only ever 0, 1, or 2.',
      'Intended as a single O(n) pass with three pointers -- calling a general sort function defeats the point of the exercise, though it is not separately graded here.',
    ],
    hints: {
      small: 'Three regions grow from the outside in: 0s at the front (before low), 2s at the back (after high), and the mid pointer scans the unknown middle region.',
      strong: 'low=mid=0; high=len(nums)-1. While mid<=high: if nums[mid]==0: swap(low,mid); low+=1; mid+=1. elif nums[mid]==1: mid+=1. else: swap(mid,high); high-=1 (do NOT advance mid here).',
      concept: 'The 2-case deliberately does not advance mid: the value just swapped in from the high end has not been examined yet, so mid must re-check it on the next loop iteration -- advancing mid there is the single most common bug in this algorithm.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'The three-pointer Dutch National Flag partition for fixed-alphabet sorting' },
    ],
    testCases: [
      { id: 'basic', label: 'Mixed Colors', input: { nums: [2, 0, 2, 1, 1, 0] }, expectedOutput: [0, 0, 1, 1, 2, 2], hidden: false },
      { id: 'small', label: 'Three Elements', input: { nums: [2, 0, 1] }, expectedOutput: [0, 1, 2], hidden: false },
      { id: 'already-sorted', label: 'Already Sorted', input: { nums: [0, 0, 1, 2, 2] }, expectedOutput: [0, 0, 1, 2, 2], hidden: true },
      { id: 'single-color', label: 'Only One Color Present', input: { nums: [1, 1, 1] }, expectedOutput: [1, 1, 1], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-21': {
    id: 'arr-hash-prob-21',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '20–25 min',
    functionName: 'trap_rain_water',
    functionSignature: 'trap_rain_water(height: list[int]) -> int',
    starterCode: `def trap_rain_water(height):
    """height[i] is the height of a bar at position i in an elevation
    map. Return the total units of rainwater trapped between the bars
    after it rains."""
    # Your implementation here
    pass
`,
    mission: 'Implement Trapping Rain Water via precomputed left-max/right-max arrays -- the classic hard array problem, and the key insight (water trapped at any position depends only on the shorter of the tallest walls to its left and right) that makes an O(n)-time, O(n)-space solution possible.',
    taskDescription: 'Implement `trap_rain_water(height)`: precompute, for every position, the tallest bar to its left (inclusive) and the tallest bar to its right (inclusive). The water trapped at that position is max(0, min(left_max, right_max) - height[i]); sum this over every position.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'The water level at position i is bounded by the SHORTER of the tallest wall to its left and the tallest wall to its right -- water cannot rise above the lower of the two containing walls.',
      'An empty height list traps 0 units.',
    ],
    hints: {
      small: 'For each position, you need to know two things: the tallest bar anywhere to its left, and the tallest bar anywhere to its right. Precompute both as arrays first.',
      strong: 'left_max[i] = max of height[0..i]; right_max[i] = max of height[i..end]. Then water at i = max(0, min(left_max[i], right_max[i]) - height[i]); sum over all i.',
      concept: 'This is a "precompute both directions, then combine" pattern -- the two-pointer O(1)-space version of this same problem exists, but the two-array version here is the clearer place to build the core insight first.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Precomputed left/right extrema as the core technique behind Trapping Rain Water' },
    ],
    testCases: [
      { id: 'classic', label: 'Classic 12-Bar Example', input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expectedOutput: 6, hidden: false },
      { id: 'six-bar', label: 'Six-Bar Example', input: { height: [4, 2, 0, 3, 2, 5] }, expectedOutput: 9, hidden: false },
      { id: 'no-trapping', label: 'Strictly Decreasing (No Trapping)', input: { height: [5, 4, 3, 2, 1] }, expectedOutput: 0, hidden: true },
      { id: 'empty', label: 'Empty Elevation Map', input: { height: [] }, expectedOutput: 0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-22': {
    id: 'arr-hash-prob-22',
    title: 'First Missing Positive',
    difficulty: 'hard',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '20–25 min',
    functionName: 'first_missing_positive',
    functionSignature: 'first_missing_positive(nums: list[int]) -> int',
    starterCode: `def first_missing_positive(nums):
    """Return the smallest positive integer (>= 1) that does NOT appear
    in nums. Must run in O(n) time using O(1) extra space (in-place
    index placement -- no new hash set/dict of size n)."""
    # Your implementation here
    pass
`,
    mission: 'Implement First Missing Positive via in-place cyclic placement -- the key realization that the answer is always in [1, n+1], so the array itself (size n) can be reused as its own O(1)-extra-space hash table.',
    taskDescription: 'Implement `first_missing_positive(nums)`: for each position, if its value v is in range [1, n] and it is not already at its "home" index v-1, swap it there -- repeat until every in-range value sits at index (value - 1). Then scan once more: the first index i where nums[i] != i+1 gives the answer i+1; if none, the answer is n+1.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Must run in O(n) time using O(1) EXTRA space -- no new set/dict sized to the input (in-place index-swapping is the intended technique).',
      'The answer is always in the range [1, n+1] for an n-element array.',
    ],
    hints: {
      small: 'The smallest missing positive for an n-element array can never exceed n+1 -- so you only ever need to "place" values in the range [1, n], everything else (negatives, zero, duplicates, too-large values) can be ignored.',
      strong: 'for i in range(n): while 1<=nums[i]<=n and nums[nums[i]-1] != nums[i]: swap nums[i] and nums[nums[i]-1]. Then scan for the first i where nums[i] != i+1; return i+1, or n+1 if none.',
      concept: 'This turns the array into its own hash table: after the placement pass, "is value v present?" becomes "is nums[v-1] == v?" -- an O(1) lookup with zero extra memory.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'In-place cyclic index placement as an O(1)-extra-space alternative to a hash set' },
    ],
    testCases: [
      { id: 'basic', label: 'Small Gap', input: { nums: [1, 2, 0] }, expectedOutput: 3, hidden: false },
      { id: 'mixed-signs', label: 'Negative and Out-of-Range Values', input: { nums: [3, 4, -1, 1] }, expectedOutput: 2, hidden: false },
      { id: 'all-too-large', label: 'Every Value Out of Range', input: { nums: [7, 8, 9, 11, 12] }, expectedOutput: 1, hidden: true },
      { id: 'consecutive-from-one', label: 'Fully Consecutive From 1', input: { nums: [1, 2, 3] }, expectedOutput: 4, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-23': {
    id: 'arr-hash-prob-23',
    title: '4Sum',
    difficulty: 'hard',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '20–25 min',
    functionName: 'four_sum',
    functionSignature: 'four_sum(nums: list[int], target: int) -> list[list[int]]',
    starterCode: `def four_sum(nums, target):
    """Return every unique quadruple [a, b, c, d] from nums (each element
    used at most once per quadruple, by index) such that a+b+c+d ==
    target. Each quadruple's 4 numbers must be listed in ascending
    order. Return the quadruples sorted by their first two positions in
    the standard sort-then-two-pointer scan order (matching the
    reference solution below) -- no duplicate quadruples (by value)."""
    # Your implementation here
    pass
`,
    mission: 'Implement 4Sum, the generalization of 3Sum/Two Sum to four numbers via sort + two fixed outer indices + a two-pointer inner scan -- and the duplicate-quadruple-avoidance logic that makes it correct on inputs with many repeated values.',
    taskDescription: 'Implement `four_sum(nums, target)`: sort the array, fix the first two indices with nested loops (skipping duplicate values at each level to avoid duplicate quadruples), then use a two-pointer scan over the remaining range for the last two numbers, skipping duplicates on the pointers as matches are found.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'No duplicate quadruples in the output, even if nums has many repeated values.',
      'Each quadruple\'s own 4 numbers must be in ascending order.',
      'Sort nums first -- both the duplicate-skipping and the two-pointer scan depend on it.',
    ],
    hints: {
      small: 'This is 3Sum with one more fixed outer loop wrapped around it -- sort first, then for each pair of fixed indices (i, j), two-pointer-scan the remainder for the last two numbers.',
      strong: 'Sort nums. For i in range(n-3), skip if arr[i]==arr[i-1]. For j in range(i+1, n-2), skip if arr[j]==arr[j-1] (and j>i+1). Two-pointer l=j+1, r=n-1: if sum==target, record and skip duplicate l/r values; if sum<target, l+=1; else r-=1.',
      concept: 'Skipping a duplicate value at each fixed-index level (i, j) AND on the two moving pointers (l, r) after a match are two SEPARATE duplicate-avoidance checks -- missing either one is the most common source of duplicate quadruples in a naive implementation.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Sort + fixed-index + two-pointer as the general k-Sum pattern' },
    ],
    testCases: [
      { id: 'classic', label: 'Classic Example (Target 0)', input: { nums: [1, 0, -1, 0, -2, 2], target: 0 }, expectedOutput: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]], hidden: false },
      { id: 'all-same', label: 'All Identical Values', input: { nums: [2, 2, 2, 2, 2], target: 8 }, expectedOutput: [[2, 2, 2, 2]], hidden: false, description: 'Heavy duplicates must collapse to exactly one quadruple' },
      { id: 'no-solution', label: 'No Quadruple Sums to Target', input: { nums: [1, 2, 3, 4], target: 100 }, expectedOutput: [], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'arr-hash-prob-24': {
    id: 'arr-hash-prob-24',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'hard',
    topic: 'Arrays / Hashing / Two Pointers',
    estimatedTime: '25–30 min',
    functionName: 'find_median_sorted_arrays',
    functionSignature: 'find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float',
    starterCode: `def find_median_sorted_arrays(nums1, nums2):
    """nums1 and nums2 are each already sorted ascending. Return the
    median of the combined (conceptually merged) sorted array, as a
    float, in O(log(min(len(nums1), len(nums2)))) time -- do not
    actually merge the two arrays."""
    # Your implementation here
    pass
`,
    mission: 'Implement the binary-search-on-partition-point solution to Median of Two Sorted Arrays -- one of the most-cited "hard" interview problems, solved by binary searching for a partition rather than ever merging the arrays.',
    taskDescription: 'Implement `find_median_sorted_arrays(nums1, nums2)`: binary search over the SHORTER array for a partition index i (with the other array\'s partition j determined by i, so the left halves together hold exactly half the total elements), such that every element left of the partition is <= every element right of it. The median is then derived directly from the four boundary values around that partition.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Must run in O(log(min(m, n))) time -- binary search over the shorter array, never merge the two arrays.',
      'Return a float even when the answer is a whole number (e.g. 2.0, not 2).',
      'One of the two input arrays may be empty; the other is never empty at the same time.',
    ],
    hints: {
      small: 'Binary search for how many elements of the SHORTER array belong on the "left half" of the combined array -- the matching count from the longer array is then forced by the total length.',
      strong: 'Binary search i in [0, m] over the shorter array (length m); j = (m+n+1)//2 - i. Track left1/right1 (around i in nums1) and left2/right2 (around j in nums2) using -inf/+inf at the boundaries. If max(left1,left2) <= min(right1,right2), you found the partition -- return max(left1,left2) if total length is odd, else the average of max(left1,left2) and min(right1,right2).',
      concept: 'Binary searching the shorter array specifically (not either array arbitrarily) is what keeps the complexity at O(log(min(m,n))) -- swapping to always search the shorter side is a one-line guard worth remembering as a general pattern for two-array partition problems.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Binary search on an answer/partition point, applied across two sorted arrays' },
    ],
    testCases: [
      { id: 'odd-total', label: 'Odd Total Length', input: { nums1: [1, 3], nums2: [2] }, expectedOutput: 2.0, hidden: false },
      { id: 'even-total', label: 'Even Total Length', input: { nums1: [1, 2], nums2: [3, 4] }, expectedOutput: 2.5, hidden: false },
      { id: 'one-empty', label: 'One Array Empty', input: { nums1: [], nums2: [1] }, expectedOutput: 1.0, hidden: true },
      { id: 'all-same-value', label: 'All Values Identical', input: { nums1: [0, 0], nums2: [0, 0] }, expectedOutput: 0.0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },

  // --- Agents, MCP & Systems batch 2 (ranks 446-460) -- same real-content
  // pattern as batch 1: hand-written functions, every testCase.expectedOutput
  // computed by actually running the reference implementation.
  'agents-mcp-systems-prob-16': {
    id: 'agents-mcp-systems-prob-16',
    title: 'Keyword-Based Agent Tool Router',
    difficulty: 'easy',
    topic: 'Agent Orchestration',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'route_to_tool',
    functionSignature: 'route_to_tool(query: str, tool_keywords: dict[str, list[str]]) -> str',
    starterCode: `import re

def route_to_tool(query, tool_keywords):
    """Pick the tool whose keyword list has the most matches among the
    query's lowercase word tokens. Ties broken alphabetically by tool
    name. Raise ValueError if tool_keywords is empty or no tool matches
    any token."""
    # Your implementation here
    pass
`,
    mission: 'Implement the simplest real form of agent tool routing: before an LLM-based router or embedding-based intent classifier, a keyword-overlap router is the cheap first pass many real agent systems still use to shortlist or directly dispatch a tool call.',
    taskDescription: 'Implement `route_to_tool(query, tool_keywords)`. Tokenize `query` into lowercase alphanumeric words. For each tool (in alphabetical order), count how many of its keywords appear among those tokens. Return the tool name with the highest count (ties go to whichever comes first alphabetically, since it is checked first and a later tool needs a STRICTLY higher score to replace it).',
    constraints: [
      'Must raise ValueError if `tool_keywords` is empty.',
      'Must raise ValueError if no tool has any matching keyword (score 0 for every tool).',
      'Tokenization is case-insensitive; only whole alphanumeric tokens count (not substrings).',
      'Ties are broken alphabetically by tool name.',
    ],
    hints: {
      small: 'Extract query tokens once with `re.findall(r"[a-z0-9]+", query.lower())` and put them in a set for O(1) membership checks.',
      strong: 'Iterate `sorted(tool_keywords)` so ties naturally resolve alphabetically, and only replace the current best when a tool\'s score is STRICTLY greater than the best score so far.',
      concept: 'This is deliberately a cheap lexical pre-filter, not a semantic router -- production agent systems often layer this in front of a more expensive embedding-similarity or LLM-based router to short-circuit the obvious cases.',
    },
    conceptConnections: [
      { title: 'Routing & Supervisor Patterns', route: '/docs/agents/routing-and-supervisor', description: 'Keyword routing is the cheapest tier of a real agent tool-routing pipeline' },
    ],
    testCases: [
      {
        id: 'weather',
        label: 'Weather Query',
        input: { query: "What's the weather forecast for tomorrow?", tool_keywords: { weather: ['weather', 'temperature', 'forecast'], calculator: ['add', 'subtract', 'multiply', 'calculate'], search: ['search', 'find', 'lookup'] } },
        expectedOutput: 'weather',
        hidden: false,
        description: 'Matches "weather" and "forecast" -- 2 keyword hits beats 0 for the other tools',
      },
      {
        id: 'calculator',
        label: 'Calculator Query',
        input: { query: 'Please calculate and add these numbers', tool_keywords: { weather: ['weather', 'temperature', 'forecast'], calculator: ['add', 'subtract', 'multiply', 'calculate'], search: ['search', 'find', 'lookup'] } },
        expectedOutput: 'calculator',
        hidden: false,
      },
      {
        id: 'alphabetical-tiebreak',
        label: 'Tie Goes to the Alphabetically First Tool',
        input: { query: 'search and find lookup', tool_keywords: { search: ['search', 'find', 'lookup'], zsearch: ['search', 'find', 'lookup'] } },
        expectedOutput: 'search',
        hidden: true,
        description: 'Both tools score 3 -- "search" wins for being alphabetically first',
      },
      {
        id: 'no-match',
        label: 'No Tool Matches',
        input: { query: 'random unrelated text', tool_keywords: { weather: ['weather'], calculator: ['add'] } },
        expectError: 'ValueError',
        hidden: true,
      },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-17': {
    id: 'agents-mcp-systems-prob-17',
    title: 'Parse an MCP Resource URI',
    difficulty: 'easy',
    topic: 'Model Context Protocol',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'parse_mcp_resource_uri',
    functionSignature: 'parse_mcp_resource_uri(uri: str, allowed_schemes: list[str]) -> tuple[str, str]',
    starterCode: `def parse_mcp_resource_uri(uri, allowed_schemes):
    """Split an MCP resource URI of the form "scheme://path" into
    (scheme, path). Raise ValueError if the URI has no "://" separator,
    or if the scheme is not in allowed_schemes."""
    # Your implementation here
    pass
`,
    mission: 'Implement the URI parser an MCP client needs before it can fetch a "resource" (MCP\'s term for an addressable piece of context a server exposes) -- every resource is identified by a URI, and a client must validate the scheme against what it actually knows how to fetch before acting on it.',
    taskDescription: 'Implement `parse_mcp_resource_uri(uri, allowed_schemes)`. Split `uri` on the FIRST `"://"` into `(scheme, path)`. Raise `ValueError` if there is no `"://"` in `uri`, or if `scheme` is not in `allowed_schemes`.',
    constraints: [
      'Must raise ValueError if the URI contains no "://".',
      'Must raise ValueError if the scheme is not present in allowed_schemes.',
      'Only the FIRST "://" is a delimiter -- the path may itself contain "://" later (rare but not disallowed).',
      'The returned path is everything after the first "://", unmodified.',
    ],
    hints: {
      small: '`uri.split("://", 1)` splits on only the first occurrence, giving you exactly `[scheme, path]`.',
      strong: 'Check `"://" not in uri` first and raise before attempting the split; check scheme membership in `allowed_schemes` after splitting.',
      concept: 'Validating the scheme against an explicit allowlist (not just "does it parse") is the real security-relevant step -- an MCP client blindly fetching whatever scheme a server names (e.g. an unexpected `file://` from a remote server) is exactly the kind of resource-access bug an allowlist prevents.',
    },
    conceptConnections: [
      { title: 'MCP Protocol Deep Dive', route: '/docs/agents/mcp/protocol-deep-dive', description: 'Resources are one of MCP\'s three core primitives (alongside tools and prompts), each addressed by URI' },
    ],
    testCases: [
      { id: 'file-scheme', label: 'File Scheme', input: { uri: 'file:///home/user/doc.txt', allowed_schemes: ['file', 'https'] }, expectedOutput: ['file', '/home/user/doc.txt'], hidden: false },
      { id: 'https-scheme', label: 'HTTPS Scheme', input: { uri: 'https://example.com/api', allowed_schemes: ['file', 'https'] }, expectedOutput: ['https', 'example.com/api'], hidden: false },
      { id: 'disallowed-scheme', label: 'Scheme Not Allowed', input: { uri: 'ftp://x', allowed_schemes: ['file', 'https'] }, expectError: 'ValueError', hidden: true },
      { id: 'malformed', label: 'No Scheme Separator', input: { uri: 'not-a-uri', allowed_schemes: ['file'] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-18': {
    id: 'agents-mcp-systems-prob-18',
    title: 'Compute a Latency Percentile (p95/p99)',
    difficulty: 'medium',
    topic: 'MLOps & Deployment',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'percentile',
    functionSignature: 'percentile(values: list[float], p: float) -> float',
    starterCode: `def percentile(values, p):
    """Return the p-th percentile (0 <= p <= 100) of values using linear
    interpolation between the two nearest ranks (the same method
    numpy.percentile uses by default). Raise ValueError if values is
    empty or p is outside [0, 100]."""
    # Your implementation here
    pass
`,
    mission: 'Implement the p95/p99 latency percentile calculation every SLO dashboard and alerting rule is built on -- a mean latency hides exactly the slow-tail requests an SLO cares about, which is why real systems always threshold on a percentile, not an average.',
    taskDescription: 'Implement `percentile(values, p)`. Sort `values`, compute the fractional rank `r = (p/100) * (n-1)`, and linearly interpolate between `values[floor(r)]` and `values[ceil(r)]` by the fractional part of `r`. Raise `ValueError` if `values` is empty or `p` is not in `[0, 100]`.',
    constraints: [
      'Must raise ValueError if values is empty.',
      'Must raise ValueError if p < 0 or p > 100.',
      'p=0 returns the minimum; p=100 returns the maximum.',
      'Uses linear interpolation between ranks, not nearest-rank rounding.',
    ],
    hints: {
      small: 'Sort the values first. The fractional rank is `(p / 100) * (n - 1)` -- its integer part is the lower index, its fractional part is the interpolation weight.',
      strong: 'lower = int(rank); upper = lower + 1 unless lower is already the last index; return `s[lower] + (s[upper] - s[lower]) * (rank - lower)`.',
      concept: 'p99 latency (not average latency) is the standard SLO metric because it directly answers "how bad is the worst-affecting-real-users tail," which an average can hide behind a large number of fast requests.',
    },
    conceptConnections: [
      { title: 'Production Reliability', route: '/docs/mlops/production-reliability', description: 'Latency percentiles are the standard metric behind real SLOs and alerting thresholds' },
    ],
    testCases: [
      { id: 'p50', label: 'Median (p50)', input: { values: [12, 45, 23, 67, 34, 89, 21, 56, 78, 90], p: 50 }, expectedOutput: 50.5, hidden: false },
      { id: 'p95', label: 'p95', input: { values: [12, 45, 23, 67, 34, 89, 21, 56, 78, 90], p: 95 }, expectedOutput: 89.55, hidden: false },
      { id: 'p0', label: 'p0 Is the Minimum', input: { values: [12, 45, 23, 67, 34, 89, 21, 56, 78, 90], p: 0 }, expectedOutput: 12.0, hidden: false },
      { id: 'p100', label: 'p100 Is the Maximum', input: { values: [12, 45, 23, 67, 34, 89, 21, 56, 78, 90], p: 100 }, expectedOutput: 90.0, hidden: true },
      { id: 'empty-values', label: 'Empty Values', input: { values: [], p: 50 }, expectError: 'ValueError', hidden: true },
      { id: 'bad-p', label: 'p Out of Range', input: { values: [1, 2, 3], p: 150 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-19': {
    id: 'agents-mcp-systems-prob-19',
    title: 'Find When a Write Quorum Is Reached',
    difficulty: 'easy',
    topic: 'Distributed Systems',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'quorum_reached_at',
    functionSignature: 'quorum_reached_at(acks: list[bool], quorum: int) -> int',
    starterCode: `def quorum_reached_at(acks, quorum):
    """acks is an ordered list of per-replica ack booleans as they arrive.
    Return the 0-based index of the ack at which the running count of
    True acks FIRST reaches quorum, or -1 if it never does. Raise
    ValueError if quorum <= 0."""
    # Your implementation here
    pass
`,
    mission: 'Implement the quorum-detection check a distributed write path (Dynamo-style replication, Raft commit) uses to decide the earliest moment it can safely acknowledge a write back to the client -- as soon as quorum is met, waiting for the remaining replicas only adds latency, not safety.',
    taskDescription: 'Implement `quorum_reached_at(acks, quorum)`. Walk `acks` in order, keeping a running count of `True` values. Return the index at which that count first reaches `quorum`. Return `-1` if quorum is never reached across all acks.',
    constraints: [
      'Must raise ValueError if quorum <= 0.',
      'Only `True` values count toward the running total; `False` acks are ignored, not counted as failures that reset anything.',
      'An empty `acks` list returns -1.',
      'Returns the index of the ack that CAUSED quorum to be reached, not the count itself.',
    ],
    hints: {
      small: 'Track a running `count`, incrementing it only when `acks[i]` is `True`.',
      strong: 'Check `count >= quorum` immediately after each increment and return `i` right there -- do not wait until the loop ends.',
      concept: 'A quorum write deliberately does not wait for ALL replicas to ack -- requiring only a majority (or configured W) is what lets the system stay available and low-latency even when some replicas are slow or temporarily unreachable.',
    },
    conceptConnections: [
      { title: 'Networking & Distributed Systems', route: '/docs/cs-fundamentals/networking-and-distributed-systems', description: 'Quorum-based replication (W acks out of N replicas) as a core distributed-systems durability pattern' },
    ],
    testCases: [
      { id: 'reached', label: 'Quorum Reached Mid-Sequence', input: { acks: [true, false, true, true], quorum: 3 }, expectedOutput: 3, hidden: false, description: 'The 3rd True ack lands at index 3 (index 1 was False and does not count)' },
      { id: 'never-reached', label: 'Quorum Never Reached', input: { acks: [true, true], quorum: 3 }, expectedOutput: -1, hidden: false },
      { id: 'empty-acks', label: 'No Acks Yet', input: { acks: [], quorum: 1 }, expectedOutput: -1, hidden: true },
      { id: 'bad-quorum', label: 'Non-Positive Quorum', input: { acks: [true], quorum: 0 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-20': {
    id: 'agents-mcp-systems-prob-20',
    title: 'Binary-Quantized Hamming Distance Search',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'hamming_search',
    functionSignature: 'hamming_search(query: list[float], vectors: list[list[float]], k: int) -> list[int]',
    starterCode: `def hamming_search(query, vectors, k):
    """Binary-quantize query and every vector (1 bit per dimension: 1 if
    the value is >= 0, else 0), then return the indices of the k vectors
    with the smallest Hamming distance to the quantized query, ties
    broken by lower index. Raise ValueError if k <= 0, k > len(vectors),
    or any vector's dimensionality differs from query's."""
    # Your implementation here
    pass
`,
    mission: 'Implement binary quantization + Hamming-distance search, the real technique some vector databases use for an extremely fast, low-memory first-pass filter over billions of vectors before a slower, more precise re-ranking pass over the survivors.',
    taskDescription: 'Implement `hamming_search(query, vectors, k)`. Quantize every vector (including `query`) to a bitstring: 1 bit per dimension, `1` if the value is `>= 0` else `0`. Return the indices of the `k` vectors with the smallest Hamming distance (count of differing bits) to the quantized query, sorted ascending by distance, ties broken by lower original index.',
    constraints: [
      'Must raise ValueError if k <= 0.',
      'Must raise ValueError if k exceeds the number of vectors.',
      'Must raise ValueError if any vector\'s length differs from query\'s length.',
      'A value of exactly 0.0 quantizes to bit 1 (the ">= 0" rule, not "> 0").',
    ],
    hints: {
      small: 'Write a helper that turns a vector into a bitstring: `\'\'.join(\'1\' if x >= 0 else \'0\' for x in v)`.',
      strong: 'Hamming distance between two equal-length bitstrings is just the count of positions where the characters differ -- `sum(1 for a, b in zip(bits_a, bits_b) if a != b)`.',
      concept: 'Hamming distance on bit-packed vectors can be computed with hardware-accelerated XOR + popcount, which is why binary quantization trades a large amount of precision for a large speedup -- it is deliberately a cheap first-pass filter, not the final ranking.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'Binary quantization is a real, extreme-compression alternative to scalar quantization for large-scale ANN search' },
    ],
    testCases: [
      { id: 'basic', label: 'Top 2 by Hamming Distance', input: { query: [1, -1, 1], vectors: [[1, -1, 1], [1, 1, 1], [-1, -1, -1], [1, -1, -1]], k: 2 }, expectedOutput: [0, 1], hidden: false, description: 'Vector 0 is an exact bit match (distance 0); vectors 1 and 3 both differ by 1 bit, index tiebreak picks 1' },
      { id: 'all-vectors', label: 'k Equals Vector Count', input: { query: [1, -1, 1], vectors: [[1, -1, 1], [1, 1, 1], [-1, -1, -1], [1, -1, -1]], k: 4 }, expectedOutput: [0, 1, 3, 2], hidden: false },
      { id: 'k-too-large', label: 'k Exceeds Vector Count', input: { query: [1, -1, 1], vectors: [[1, -1, 1], [1, 1, 1], [-1, -1, -1], [1, -1, -1]], k: 5 }, expectError: 'ValueError', hidden: true },
      { id: 'dimension-mismatch', label: 'Dimension Mismatch', input: { query: [1, -1, 1], vectors: [[1, 1]], k: 1 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-21': {
    id: 'agents-mcp-systems-prob-21',
    title: 'Attention-Weighted Pooling of Image Patches',
    difficulty: 'medium',
    topic: 'Multimodal AI',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'attention_weighted_pool',
    functionSignature: 'attention_weighted_pool(patch_embeddings: list[list[float]], attention_weights: list[float]) -> list[float]',
    starterCode: `def attention_weighted_pool(patch_embeddings, attention_weights):
    """Combine per-patch embeddings into one embedding via a weighted
    average, using attention_weights normalized to sum to 1 first (the
    caller's weights need not already sum to 1). Raise ValueError if the
    two lists differ in length, are empty, the weights sum to zero, or
    the embeddings have inconsistent dimensionality."""
    # Your implementation here
    pass
`,
    mission: 'Implement attention-weighted pooling, the real mechanism a vision-language connector (or a perceiver-resampler-style module) uses to collapse a variable-length sequence of patch embeddings into one fixed-size image representation -- weighting some patches more than others, rather than treating every patch as equally important like plain mean pooling does.',
    taskDescription: 'Implement `attention_weighted_pool(patch_embeddings, attention_weights)`. Normalize `attention_weights` so they sum to 1 (divide each by their total), then return the elementwise weighted sum of `patch_embeddings` using those normalized weights.',
    constraints: [
      'Must raise ValueError if patch_embeddings and attention_weights have different lengths.',
      'Must raise ValueError if patch_embeddings is empty.',
      'Must raise ValueError if attention_weights sum to zero (normalization would divide by zero).',
      'Must raise ValueError if the patch embeddings do not all share the same dimensionality.',
      'attention_weights need not already sum to 1 -- normalize them internally.',
    ],
    hints: {
      small: 'First compute `total = sum(attention_weights)` and normalize every weight by dividing by it.',
      strong: 'Initialize a zero vector of the embedding dimension, then for each (embedding, normalized_weight) pair add `weight * embedding[i]` into each dimension `i` of the accumulator.',
      concept: 'Because weights are normalized internally, [1, 1, 2] and [2, 2, 4] (the same ratios) must produce the IDENTICAL pooled output -- a real property of attention weights, which only ever matter in relative proportion, not absolute scale.',
    },
    conceptConnections: [
      { title: 'Modern Vision & Multimodal Models', route: '/docs/computer-vision/modern-vision-and-multimodal', description: 'Pooling patch embeddings into a single representation is a real step in vision-language model architectures' },
    ],
    testCases: [
      { id: 'basic', label: 'Weighted Pool (Unnormalized Weights)', input: { patch_embeddings: [[1, 0], [0, 1], [2, 2]], attention_weights: [1, 1, 2] }, expectedOutput: [1.25, 1.25], hidden: false },
      { id: 'scale-invariance', label: 'Same Ratios, Different Scale -- Identical Result', input: { patch_embeddings: [[1, 0], [0, 1], [2, 2]], attention_weights: [2, 2, 4] }, expectedOutput: [1.25, 1.25], hidden: false, description: 'Weights [2,2,4] are the same ratios as [1,1,2] -- normalization makes the result identical' },
      { id: 'uniform-weights', label: 'Uniform Weights Reduce to Mean Pooling', input: { patch_embeddings: [[2, 0], [0, 2], [4, 4]], attention_weights: [1, 1, 1] }, expectedOutput: [2.0, 2.0], hidden: true },
      { id: 'zero-weights', label: 'Weights Sum to Zero', input: { patch_embeddings: [[1, 0], [0, 1]], attention_weights: [0, 0] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-22': {
    id: 'agents-mcp-systems-prob-22',
    title: 'Deduplicate Near-Identical Retrieved Passages',
    difficulty: 'easy',
    topic: 'Retrieval-Augmented Generation',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'dedupe_passages',
    functionSignature: 'dedupe_passages(passages: list[str]) -> list[str]',
    starterCode: `import re

def dedupe_passages(passages):
    """Remove passages that are duplicates of an earlier one after
    normalizing (strip, lowercase, collapse internal whitespace runs to a
    single space). Keep the FIRST occurrence's original (non-normalized)
    text, preserving overall order."""
    # Your implementation here
    pass
`,
    mission: 'Implement the cheap, exact-after-normalization deduplication pass a RAG pipeline runs on its retrieved passages -- two chunks that differ only by capitalization or stray whitespace (a common artifact of overlapping chunking or multiple retrieval sources) waste context-window budget saying the same thing twice.',
    taskDescription: 'Implement `dedupe_passages(passages)`. For each passage, compute a normalized form (`strip()`, lowercase, collapse any run of whitespace to a single space). Keep a passage only if its normalized form has not been seen in an earlier passage, and return the kept passages in their ORIGINAL (non-normalized) text and original relative order.',
    constraints: [
      'Comparison is on the normalized form; the returned strings are the original, un-normalized text.',
      'The FIRST occurrence (by original order) of each normalized form is kept; later duplicates are dropped.',
      'An empty list returns an empty list.',
      'Normalization: strip leading/trailing whitespace, lowercase, and collapse internal whitespace runs to one space.',
    ],
    hints: {
      small: 'Use `re.sub(r\'\\s+\', \' \', p.strip().lower())` to compute each passage\'s normalized form.',
      strong: 'Track normalized forms already seen in a `set`; append a passage to the result (its ORIGINAL text) only the first time its normalized form is new.',
      concept: 'This is deliberately exact-after-normalization dedup, not semantic/embedding-based dedup (see the existing near-duplicate-embeddings problem for that) -- a cheap, fast text-level pass that catches whitespace/capitalization noise before ever reaching a vector comparison.',
    },
    conceptConnections: [
      { title: 'Retrieval-Augmented Generation', route: '/docs/llms-genai/rag', description: 'Deduplicating retrieved passages is a real post-retrieval cleanup step before assembling the LLM prompt' },
    ],
    testCases: [
      {
        id: 'basic',
        label: 'Whitespace and Case Variants Collapse',
        input: { passages: ['The Cat Sat.', 'the cat sat.', 'A dog barked.', '  The   Cat Sat.  '] },
        expectedOutput: ['The Cat Sat.', 'A dog barked.'],
        hidden: false,
        description: 'All 3 variants of "the cat sat." normalize identically -- only the first (original-cased) one survives',
      },
      { id: 'no-duplicates', label: 'No Duplicates Present', input: { passages: ['Unique one.', 'Unique two.', 'Unique three.'] }, expectedOutput: ['Unique one.', 'Unique two.', 'Unique three.'], hidden: false },
      { id: 'empty', label: 'Empty Input', input: { passages: [] }, expectedOutput: [], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-23': {
    id: 'agents-mcp-systems-prob-23',
    title: 'Assign Subtasks to Capable Agents',
    difficulty: 'medium',
    topic: 'Agent Orchestration',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'assign_subtasks',
    functionSignature: 'assign_subtasks(subtasks: list[dict], agents: dict[str, list[str]]) -> list[str]',
    starterCode: `def assign_subtasks(subtasks, agents):
    """Each subtask is {"task": str, "requires": str}. agents maps
    agent_name -> list of capabilities. Assign each subtask, in order, to
    the FIRST agent (in agents' iteration order) whose capability list
    contains the subtask's "requires" value. Return the list of assigned
    agent names, one per subtask, in subtask order. Raise ValueError if
    no agent can handle a subtask's required capability."""
    # Your implementation here
    pass
`,
    mission: 'Implement the capability-based task delegation a multi-agent supervisor uses to decide which specialist sub-agent should handle each piece of a larger plan -- the real routing decision behind a supervisor/orchestrator pattern with multiple narrow, capability-specific agents instead of one generalist.',
    taskDescription: 'Implement `assign_subtasks(subtasks, agents)`. For each subtask (in order), scan `agents` in their given order and assign the subtask to the first agent whose capability list contains `subtask["requires"]`. Return the list of assigned agent names, one per subtask.',
    constraints: [
      'Subtasks are processed in the order given; each is assigned independently.',
      'For each subtask, the FIRST matching agent in `agents`\' iteration order is chosen -- not the "best" or "least busy" one.',
      'Must raise ValueError if no agent in `agents` has the required capability for some subtask.',
      'An empty `subtasks` list returns an empty list.',
    ],
    hints: {
      small: 'For each subtask, loop over `agents.items()` and return/record the first agent name whose capability list contains `subtask["requires"]`.',
      strong: 'Use a `for...else` (or a flag) to detect the "no agent found" case cleanly and raise ValueError there, rather than letting a missing match silently produce `None`.',
      concept: 'This is deliberately a simple first-match policy, not an optimal assignment (like a bipartite matching or load-balancing algorithm) -- real supervisor/orchestrator implementations often start exactly this simple and only add load-awareness once first-match proves insufficient.',
    },
    conceptConnections: [
      { title: 'Multi-Agent Systems', route: '/docs/agents/multi-agent-systems', description: 'Capability-based task delegation to specialist sub-agents is a core multi-agent orchestration pattern' },
    ],
    testCases: [
      {
        id: 'basic',
        label: 'Three Subtasks, Three Capabilities',
        input: {
          subtasks: [{ task: 't1', requires: 'code' }, { task: 't2', requires: 'search' }, { task: 't3', requires: 'translate' }],
          agents: { agent_a: ['search', 'summarize'], agent_b: ['code', 'search'], agent_c: ['translate'] },
        },
        expectedOutput: ['agent_b', 'agent_a', 'agent_c'],
        hidden: false,
        description: '"search" matches agent_a first even though agent_b also has it, since agent_a comes first in iteration order',
      },
      {
        id: 'no-agent-found',
        label: 'No Agent Has the Required Capability',
        input: { subtasks: [{ task: 't4', requires: 'unknown_cap' }], agents: { agent_a: ['search'], agent_b: ['code'] } },
        expectError: 'ValueError',
        hidden: true,
      },
      { id: 'empty-subtasks', label: 'No Subtasks', input: { subtasks: [], agents: { agent_a: ['search'] } }, expectedOutput: [], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-24': {
    id: 'agents-mcp-systems-prob-24',
    title: 'Negotiate MCP Client/Server Capabilities',
    difficulty: 'easy',
    topic: 'Model Context Protocol',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'negotiate_capabilities',
    functionSignature: 'negotiate_capabilities(client_caps: dict[str, bool], server_caps: dict[str, bool]) -> dict[str, bool]',
    starterCode: `def negotiate_capabilities(client_caps, server_caps):
    """Return a dict containing only the capabilities that are truthy in
    BOTH client_caps and server_caps, each mapped to True. A capability
    present in only one side, or false in either, is excluded."""
    # Your implementation here
    pass
`,
    mission: 'Implement the capability-intersection logic behind MCP\'s initialize handshake -- a client and server each declare what they support, and the session can only actually use whatever both sides agree on, exactly like an HTTP/2 or TLS feature negotiation.',
    taskDescription: 'Implement `negotiate_capabilities(client_caps, server_caps)`. Return a dict containing only the keys that are truthy in BOTH `client_caps` and `server_caps`, each mapped to `True`.',
    constraints: [
      'A capability must be truthy in BOTH dicts to appear in the result.',
      'A capability present in only one dict (regardless of its value) is excluded.',
      'A capability that is `False` in either dict is excluded, even if present in both.',
      'Every value in the returned dict is `True` -- the result only records WHICH capabilities were negotiated, not their original values.',
    ],
    hints: {
      small: 'A dict comprehension over `client_caps` checking `server_caps.get(key)` covers most of this in one line.',
      strong: '`{k: True for k in client_caps if client_caps.get(k) and server_caps.get(k)}` -- `.get()` returns `None` (falsy) for a missing key, so a capability absent on either side is naturally excluded without a separate check.',
      concept: 'This mirrors real protocol capability negotiation (TLS cipher suites, HTTP/2 SETTINGS) -- both sides advertise everything they COULD support, and the negotiated session is always the intersection, never either side\'s full list.',
    },
    conceptConnections: [
      { title: 'MCP Protocol Deep Dive', route: '/docs/agents/mcp/protocol-deep-dive', description: 'Capability negotiation happens during MCP\'s initialize handshake, before any tool/resource calls' },
    ],
    testCases: [
      {
        id: 'partial-overlap',
        label: 'Partial Overlap',
        input: { client_caps: { sampling: true, roots: true, experimental: false }, server_caps: { sampling: true, roots: false, logging: true } },
        expectedOutput: { sampling: true },
        hidden: false,
        description: 'roots is excluded (server says false), experimental is excluded (client says false), logging is excluded (client never declared it)',
      },
      { id: 'no-overlap', label: 'No Overlap', input: { client_caps: { a: true }, server_caps: { b: true } }, expectedOutput: {}, hidden: false },
      { id: 'full-overlap', label: 'Full Overlap', input: { client_caps: { x: true, y: true }, server_caps: { x: true, y: true } }, expectedOutput: { x: true, y: true }, hidden: true },
      { id: 'empty-client', label: 'Empty Client Capabilities', input: { client_caps: {}, server_caps: { x: true } }, expectedOutput: {}, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-25': {
    id: 'agents-mcp-systems-prob-25',
    title: 'Population Stability Index for Model Drift',
    difficulty: 'hard',
    topic: 'MLOps & Deployment',
    estimatedTime: '20–25 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'population_stability_index',
    functionSignature: 'population_stability_index(baseline_counts: list[int], current_counts: list[int]) -> float',
    starterCode: `import math

def population_stability_index(baseline_counts, current_counts):
    """Compute the Population Stability Index (PSI) between a baseline
    and current bucketed distribution (same buckets, so same length).
    For each bucket: convert counts to proportions of their own total,
    floor each proportion at 1e-6 to avoid log(0), then sum
    (cur_pct - base_pct) * ln(cur_pct / base_pct) across buckets. Raise
    ValueError if the lengths differ, either list is empty, or either
    total is zero."""
    # Your implementation here
    pass
`,
    mission: 'Implement the Population Stability Index, the standard metric production ML monitoring uses to detect real distribution drift between the data a model was trained on and the data it is currently seeing -- the actual number behind a "feature drift" alert firing.',
    taskDescription: 'Implement `population_stability_index(baseline_counts, current_counts)`. Convert each list of bucket counts into proportions (divide by that list\'s own total). Floor every proportion at `1e-6` (to avoid `log(0)`). Return `sum((cur_pct - base_pct) * ln(cur_pct / base_pct))` across all buckets. Raise `ValueError` if the two lists have different lengths, either is empty, or either sums to zero.',
    constraints: [
      'Must raise ValueError if baseline_counts and current_counts have different lengths.',
      'Must raise ValueError if either list is empty.',
      'Must raise ValueError if either list sums to zero.',
      'A proportion of exactly 0 in a bucket is floored to 1e-6 before the log, never passed to `math.log` directly.',
      'Identical baseline and current distributions produce a PSI of exactly 0.0.',
    ],
    hints: {
      small: 'Compute proportions with `count / total` for each side\'s own total, then apply `max(proportion, 1e-6)` to each.',
      strong: 'PSI is a sum, not a single formula call -- accumulate `(cur_pct - base_pct) * math.log(cur_pct / base_pct)` bucket by bucket over `zip(baseline_counts, current_counts)`.',
      concept: 'PSI is asymmetric-looking but actually a symmetric-in-effect divergence measure: below ~0.1 is considered stable, 0.1-0.25 moderate drift worth watching, above 0.25 significant drift -- these are the real thresholds production monitoring dashboards use to decide whether a model needs retraining.',
    },
    conceptConnections: [
      { title: 'Monitoring & Drift Detection', route: '/docs/mlops/monitoring-and-drift', description: 'PSI is the standard metric behind real feature-drift and model-drift alerts' },
    ],
    testCases: [
      { id: 'identical', label: 'Identical Distributions', input: { baseline_counts: [100, 100, 100, 100], current_counts: [100, 100, 100, 100] }, expectedOutput: 0.0, hidden: false, description: 'No drift at all -- PSI is exactly 0' },
      { id: 'shifted', label: 'Shifted Distribution', input: { baseline_counts: [100, 100, 100, 100], current_counts: [150, 90, 90, 70] }, expectedOutput: 0.0827017850918168, hidden: false },
      { id: 'vanished-bucket', label: 'A Bucket Drops to Zero', input: { baseline_counts: [50, 50], current_counts: [100, 0] }, expectedOutput: 6.90774215661876, hidden: true, description: 'The epsilon floor keeps this finite instead of raising a math domain error' },
      { id: 'length-mismatch', label: 'Different Bucket Counts', input: { baseline_counts: [1, 2], current_counts: [1, 2, 3] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-26': {
    id: 'agents-mcp-systems-prob-26',
    title: 'Compare Two Vector Clocks',
    difficulty: 'hard',
    topic: 'Distributed Systems',
    estimatedTime: '20–25 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'compare_vector_clocks',
    functionSignature: 'compare_vector_clocks(a: dict[str, int], b: dict[str, int]) -> str',
    starterCode: `def compare_vector_clocks(a, b):
    """a and b are vector clocks (node_id -> counter; a missing node is
    implicitly counter 0). Return "equal" if all counters match, "before"
    if a happened-before b (every counter in a <= the matching one in b,
    at least one strictly less), "after" for the symmetric case, or
    "concurrent" if neither dominates the other."""
    # Your implementation here
    pass
`,
    mission: 'Implement vector clock comparison, the real algorithm distributed systems (and CRDTs, and version-vector-based databases like Riak/DynamoDB) use to determine causality between two events across different nodes without a shared global clock -- exactly the mechanism that answers "did this write happen before, after, or concurrently with that one?"',
    taskDescription: 'Implement `compare_vector_clocks(a, b)`. Treat a missing key in either clock as counter 0. Compare every node ID present in either clock: if every coordinate of `a` is `<=` the matching coordinate of `b` (with at least one strictly less), return `"before"`; the symmetric case returns `"after"`; if all coordinates match exactly, return `"equal"`; otherwise (some coordinate greater, some lesser) return `"concurrent"`.',
    constraints: [
      'A node ID present in only one clock is treated as counter 0 in the other.',
      'Exactly one of "equal", "before", "after", "concurrent" is always returned.',
      '"concurrent" means neither clock happened-before the other -- some coordinate favors each side.',
      '"equal" only when every coordinate (over the union of node IDs) matches exactly.',
    ],
    hints: {
      small: 'Compute the union of node IDs from both clocks, and for each one compare `a.get(node, 0)` against `b.get(node, 0)`.',
      strong: 'Track two booleans while scanning: `le` (a <= b so far) and `ge` (a >= b so far), clearing `le` on any coordinate where a > b and clearing `ge` on any coordinate where a < b. At the end: both true means equal, only `le` means before, only `ge` means after, neither means concurrent.',
      concept: 'A vector clock captures partial (not total) ordering -- unlike a single Lamport timestamp, it can correctly say "these two events are causally unrelated" (concurrent) instead of forcing every pair of events into a single global before/after order that a single scalar clock would incorrectly impose.',
    },
    conceptConnections: [
      { title: 'Networking & Distributed Systems', route: '/docs/cs-fundamentals/networking-and-distributed-systems', description: 'Vector clocks are the standard mechanism for tracking causality in a distributed system without a shared clock' },
    ],
    testCases: [
      { id: 'equal', label: 'Equal Clocks', input: { a: { n1: 1, n2: 2 }, b: { n1: 1, n2: 2 } }, expectedOutput: 'equal', hidden: false },
      { id: 'before', label: 'A Happened Before B', input: { a: { n1: 1, n2: 1 }, b: { n1: 1, n2: 2 } }, expectedOutput: 'before', hidden: false },
      { id: 'concurrent', label: 'Concurrent Events', input: { a: { n1: 2, n2: 1 }, b: { n1: 1, n2: 2 } }, expectedOutput: 'concurrent', hidden: false, description: 'n1 favors a, n2 favors b -- neither dominates' },
      { id: 'missing-node', label: 'A Missing Node Counts as Zero', input: { a: { n1: 1 }, b: { n1: 1, n2: 1 } }, expectedOutput: 'before', hidden: true, description: "a's implicit n2=0 is <= b's n2=1, and every other coordinate matches, so a happened-before b" },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-27': {
    id: 'agents-mcp-systems-prob-27',
    title: 'Apply Insert/Delete Operations to a Vector Index',
    difficulty: 'medium',
    topic: 'Vector Search & Index Optimization',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'apply_index_operations',
    functionSignature: 'apply_index_operations(operations: list[tuple[str, str]]) -> list[str]',
    starterCode: `def apply_index_operations(operations):
    """Each operation is ("insert", id) or ("delete", id), applied in
    order to an initially empty index. Return the sorted list of ids
    still live after all operations. Raise ValueError when deleting an id
    that is not currently live, or on an unrecognized operation kind."""
    # Your implementation here
    pass
`,
    mission: 'Implement the live-ID bookkeeping behind vector index mutation -- many real ANN indexes (HNSW in particular) do not support true in-place deletion, so a "delete" is implemented as a tombstone rather than actually removing the vector, and this live-set simulation is exactly the logic that tracks which IDs a query should still be allowed to return.',
    taskDescription: 'Implement `apply_index_operations(operations)`. Starting from an empty set of live IDs, apply each `("insert", id)` or `("delete", id)` operation in order. Return the sorted list of IDs still live at the end.',
    constraints: [
      'Must raise ValueError when deleting an id that is not currently live (never inserted, or already deleted).',
      'Must raise ValueError on any operation kind other than "insert" or "delete".',
      'Re-inserting an id that was previously deleted makes it live again.',
      'An empty operations list returns an empty list.',
    ],
    hints: {
      small: 'A plain `set()` of live IDs is enough state -- `insert` adds to it, `delete` removes from it.',
      strong: 'Before removing on a `delete`, check membership first and raise ValueError if the id is not present, rather than letting `set.remove` raise its own (different) exception.',
      concept: 'This models WHY many real ANN indexes use tombstoning instead of true deletion: physically removing a node from a graph-based index like HNSW is expensive and can break the graph\'s connectivity, so a "delete" instead just marks an id as dead and filters it from results, with actual removal deferred to a periodic full rebuild.',
    },
    conceptConnections: [
      { title: 'Vector Databases', route: '/docs/databases/vector/overview', description: 'Tombstone-based deletion is how many production ANN indexes handle mutability' },
    ],
    testCases: [
      { id: 'insert-delete-insert', label: 'Insert, Delete, Insert Again', input: { operations: [['insert', 'a'], ['insert', 'b'], ['delete', 'a'], ['insert', 'c']] }, expectedOutput: ['b', 'c'], hidden: false },
      { id: 'reinsert-after-delete', label: 'Re-Insert After Delete', input: { operations: [['insert', 'x'], ['delete', 'x'], ['insert', 'x']] }, expectedOutput: ['x'], hidden: false },
      { id: 'empty-ops', label: 'No Operations', input: { operations: [] }, expectedOutput: [], hidden: true },
      { id: 'delete-nonexistent', label: 'Delete a Never-Inserted Id', input: { operations: [['delete', 'z']] }, expectError: 'ValueError', hidden: true },
      { id: 'unknown-op', label: 'Unrecognized Operation Kind', input: { operations: [['weird', 'a']] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-28': {
    id: 'agents-mcp-systems-prob-28',
    title: 'Intersection-over-Union for Bounding Boxes',
    difficulty: 'medium',
    topic: 'Multimodal AI',
    estimatedTime: '15–20 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'bbox_iou',
    functionSignature: 'bbox_iou(box_a: list[float], box_b: list[float]) -> float',
    starterCode: `def bbox_iou(box_a, box_b):
    """Each box is [x1, y1, x2, y2] (x1<x2, y1<y2). Return the
    Intersection-over-Union of the two boxes. Raise ValueError if either
    box is degenerate (x2 <= x1 or y2 <= y1)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Intersection-over-Union, the single most standard evaluation metric in object detection -- it is how a predicted bounding box is scored against ground truth, and the threshold (commonly IoU >= 0.5) that decides whether a detection counts as a correct match at all.',
    taskDescription: 'Implement `bbox_iou(box_a, box_b)`. Each box is `[x1, y1, x2, y2]`. Compute the area of their intersection rectangle (0 if they don\'t overlap) divided by the area of their union. Raise `ValueError` if either box is degenerate.',
    constraints: [
      'Must raise ValueError if either box has x2 <= x1 or y2 <= y1.',
      'Two non-overlapping boxes have IoU exactly 0.0, not an error.',
      'Two identical boxes have IoU exactly 1.0.',
      'Intersection area is computed by clamping the overlap width/height at 0, not allowing a negative "overlap".',
    ],
    hints: {
      small: 'The intersection rectangle\'s corners are `max(x1s)`, `max(y1s)`, `min(x2s)`, `min(y2s)` -- if the resulting width or height is negative, clamp it to 0 (no overlap).',
      strong: 'union = area_a + area_b - intersection_area (inclusion-exclusion) -- this is why the intersection area must not be double-subtracted or omitted.',
      concept: 'IoU >= 0.5 is the conventional threshold (used in PASCAL VOC and COCO evaluation) for counting a predicted box as a correct detection of a ground-truth box -- it is a geometric overlap measure, completely independent of any embedding or learned similarity.',
    },
    conceptConnections: [
      { title: 'Vision Tasks & Models', route: '/docs/computer-vision/vision-tasks-and-models', description: 'IoU is the standard evaluation metric for object detection bounding boxes' },
    ],
    testCases: [
      { id: 'partial-overlap', label: 'Partial Overlap', input: { box_a: [0, 0, 10, 10], box_b: [5, 5, 15, 15] }, expectedOutput: 0.14285714285714285, hidden: false, description: 'Intersection area 25, union area 175 -- 25/175 = 1/7' },
      { id: 'no-overlap', label: 'No Overlap', input: { box_a: [0, 0, 10, 10], box_b: [20, 20, 30, 30] }, expectedOutput: 0.0, hidden: false },
      { id: 'identical', label: 'Identical Boxes', input: { box_a: [0, 0, 5, 5], box_b: [0, 0, 5, 5] }, expectedOutput: 1.0, hidden: false },
      { id: 'degenerate', label: 'Degenerate Box', input: { box_a: [5, 5, 5, 5], box_b: [0, 0, 1, 1] }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python', 'numpy'] },
  },
  'agents-mcp-systems-prob-29': {
    id: 'agents-mcp-systems-prob-29',
    title: 'Jaccard Keyword Relevance for RAG Pre-Filtering',
    difficulty: 'easy',
    topic: 'Retrieval-Augmented Generation',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'jaccard_relevance',
    functionSignature: 'jaccard_relevance(query: str, chunk: str) -> float',
    starterCode: `import re

def jaccard_relevance(query, chunk):
    """Tokenize query and chunk into lowercase alphanumeric word sets, and
    return the Jaccard similarity |intersection| / |union| between them.
    Raise ValueError if either string has zero tokens."""
    # Your implementation here
    pass
`,
    mission: 'Implement Jaccard keyword relevance, a cheap lexical-overlap score real RAG pipelines use as a fast pre-filter (or a component of a hybrid score) before ever running an expensive embedding similarity comparison -- the simplest real alternative to BM25 for "does this chunk share vocabulary with the query at all?"',
    taskDescription: 'Implement `jaccard_relevance(query, chunk)`. Tokenize both strings into sets of lowercase alphanumeric words. Return `|intersection| / |union|`. Raise `ValueError` if either string tokenizes to zero words.',
    constraints: [
      'Tokenization is case-insensitive; only alphanumeric runs count as tokens (punctuation is not part of any token).',
      'Repeated words in either string do not affect the result (sets, not multisets).',
      'Must raise ValueError if either query or chunk has zero tokens.',
      'Two strings sharing no tokens return exactly 0.0, not an error.',
    ],
    hints: {
      small: 'Use `re.findall(r"[a-z0-9]+", text.lower())` to get tokens, then wrap the result in `set(...)`.',
      strong: 'Jaccard similarity is `len(set_a & set_b) / len(set_a | set_b)` -- compute both sets once each, not per pair.',
      concept: 'Jaccard similarity, unlike cosine similarity on embeddings, only ever looks at exact vocabulary overlap -- it has no notion of synonyms or semantic closeness, which is exactly why it is used as a cheap lexical SIGNAL alongside (not instead of) embedding-based relevance in a hybrid pipeline.',
    },
    conceptConnections: [
      { title: 'Retrieval & Reranking Architectures', route: '/docs/llms-genai/retrieval-and-reranking-architectures', description: 'Lexical overlap scores like Jaccard are a real component of hybrid keyword+vector retrieval' },
    ],
    testCases: [
      { id: 'partial-overlap', label: 'Partial Vocabulary Overlap', input: { query: 'the cat sat on the mat', chunk: 'a cat sat on a mat quietly' }, expectedOutput: 0.5714285714285714, hidden: false, description: '4 shared tokens (cat, sat, on, mat) over a union of 7 unique tokens' },
      { id: 'no-overlap', label: 'No Shared Vocabulary', input: { query: 'hello world', chunk: 'completely different text' }, expectedOutput: 0.0, hidden: false },
      { id: 'empty-query', label: 'Empty Query', input: { query: '', chunk: 'something' }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'agents-mcp-systems-prob-30': {
    id: 'agents-mcp-systems-prob-30',
    title: 'Exponential Backoff Retry Delays',
    difficulty: 'easy',
    topic: 'Agent Orchestration',
    estimatedTime: '10–15 min',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    functionName: 'exponential_backoff_delays',
    functionSignature: 'exponential_backoff_delays(num_attempts: int, base_delay: float, max_delay: float) -> list[float]',
    starterCode: `def exponential_backoff_delays(num_attempts, base_delay, max_delay):
    """Return the list of retry delays for num_attempts attempts, where
    the i-th delay (0-indexed) is base_delay * 2**i, capped at max_delay.
    Raise ValueError if num_attempts <= 0, base_delay <= 0, or
    max_delay < base_delay."""
    # Your implementation here
    pass
`,
    mission: 'Implement exponential backoff, the standard retry-delay schedule an agent\'s tool-calling loop (or any client of a flaky external API) uses to avoid hammering a failing service with immediate retries -- delays double each attempt, capped so retries stay bounded even after many failures.',
    taskDescription: 'Implement `exponential_backoff_delays(num_attempts, base_delay, max_delay)`. Return a list of `num_attempts` delays where the `i`-th (0-indexed) delay is `min(base_delay * 2**i, max_delay)`.',
    constraints: [
      'Must raise ValueError if num_attempts <= 0.',
      'Must raise ValueError if base_delay <= 0.',
      'Must raise ValueError if max_delay < base_delay.',
      'Each delay is capped at max_delay once the exponential growth would exceed it.',
    ],
    hints: {
      small: 'A single list comprehension over `range(num_attempts)` computing `base_delay * (2 ** i)` covers the un-capped case.',
      strong: 'Wrap each computed delay in `min(..., max_delay)` to apply the cap.',
      concept: 'The cap exists because unbounded exponential growth would eventually make a client wait absurdly long between retries -- capping keeps the retry schedule useful (a bounded worst-case wait) while still backing off aggressively enough to avoid retry storms against a struggling service.',
    },
    conceptConnections: [
      { title: 'Production Reliability', route: '/docs/mlops/production-reliability', description: 'Exponential backoff is a standard reliability pattern for retrying calls to a flaky dependency' },
    ],
    testCases: [
      { id: 'under-cap', label: 'All Delays Under the Cap', input: { num_attempts: 5, base_delay: 1, max_delay: 20 }, expectedOutput: [1, 2, 4, 8, 16], hidden: false },
      { id: 'hits-cap', label: 'Later Delays Hit the Cap', input: { num_attempts: 6, base_delay: 1, max_delay: 20 }, expectedOutput: [1, 2, 4, 8, 16, 20], hidden: false, description: 'base*2^5=32 would exceed 20, so it is capped' },
      { id: 'single-attempt', label: 'Single Attempt', input: { num_attempts: 1, base_delay: 5, max_delay: 100 }, expectedOutput: [5], hidden: true },
      { id: 'bad-num-attempts', label: 'Non-Positive num_attempts', input: { num_attempts: 0, base_delay: 1, max_delay: 20 }, expectError: 'ValueError', hidden: true },
      { id: 'max-below-base', label: 'max_delay Below base_delay', input: { num_attempts: 3, base_delay: 10, max_delay: 5 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },

  // --- Trees / Binary Search batch (real content replacing the generic
  // placeholder template). Every tree node is represented as a plain dict
  // {val, left, right} (left/right are null for an absent child, or the
  // whole tree is null for an empty tree) -- deliberately not a TreeNode
  // class, since the grading harness calls functionName(**kwargs) with
  // the raw JSON-decoded test input directly, and a dict needs no
  // separate class-construction step. Every expectedOutput below was
  // cross-checked against the well-known canonical answer for each
  // classic problem (several are verbatim LeetCode example test cases),
  // not just trusted from one reference script.
  'tree-bs-prob-1': {
    id: 'tree-bs-prob-1',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    topic: 'Trees / Binary Search',
    estimatedTime: '10–15 min',
    functionName: 'max_depth',
    functionSignature: 'max_depth(root: dict | None) -> int',
    starterCode: `def max_depth(root):
    """root: a tree node as {'val', 'left', 'right'} (left/right are None
    for an absent child), or None for an empty tree. Return the number
    of nodes along the longest path from root down to the farthest leaf
    (an empty tree has depth 0; a single node has depth 1)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Maximum Depth of Binary Tree -- the simplest possible tree recursion, and the one every other "compute something about every subtree" tree problem is a variation of.',
    taskDescription: "Implement `max_depth(root)`: an empty tree has depth 0; otherwise the depth is 1 plus the larger of the left and right subtrees' depths.",
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'An empty tree (root is None) has depth 0.',
      'A single-node tree has depth 1.',
    ],
    hints: {
      small: 'The depth of a tree is 1 (for the root) plus the depth of whichever of its two subtrees is deeper.',
      strong: 'if root is None: return 0. return 1 + max(max_depth(root["left"]), max_depth(root["right"])).',
      concept: 'This is the template for nearly every tree recursion: handle the None base case, recurse into both children, then combine their results with the current node -- diameter, balance-checking, and max path sum below are all this same shape with a different combine step.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'The base recursive pattern for tree-shaped data' },
    ],
    testCases: [
      { id: 'basic', label: 'Classic 5-Node Tree', input: { root: { val: 3, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } } }, expectedOutput: 3, hidden: false },
      { id: 'right-leaning', label: 'Right-Leaning 2-Node Tree', input: { root: { val: 1, left: null, right: { val: 2, left: null, right: null } } }, expectedOutput: 2, hidden: false },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: 0, hidden: true },
      { id: 'single', label: 'Single Node', input: { root: { val: 1, left: null, right: null } }, expectedOutput: 1, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-2': {
    id: 'tree-bs-prob-2',
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    topic: 'Trees / Binary Search',
    estimatedTime: '10–15 min',
    functionName: 'invert_tree',
    functionSignature: 'invert_tree(root: dict | None) -> dict | None',
    starterCode: `def invert_tree(root):
    """root: a tree node as {'val', 'left', 'right'}, or None. Return a
    new tree that is the mirror image of root -- every node's left and
    right children swapped, recursively."""
    # Your implementation here
    pass
`,
    mission: 'Implement Invert Binary Tree -- famous mostly for the "the guy who wrote a core dev tool couldn\'t solve this in an interview" story, and a clean example of recursion building a NEW structure rather than just computing a number.',
    taskDescription: "Implement `invert_tree(root)`: return a new tree where every node's left and right children are swapped, all the way down.",
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'An empty tree (root is None) inverts to None.',
      'Every node in the result must have its left and right subtrees swapped relative to the input, at every depth.',
    ],
    hints: {
      small: 'Inverting a tree means: invert the left subtree, invert the right subtree, then swap which one goes where.',
      strong: 'if root is None: return None. return {"val": root["val"], "left": invert_tree(root["right"]), "right": invert_tree(root["left"])}.',
      concept: 'The swap happens exactly once per node, at the level where you construct that node\'s new dict -- the two recursive calls just produce the (already-inverted) subtrees, they don\'t need to know anything about swapping themselves.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Recursion that constructs a new tree rather than just aggregating a value' },
    ],
    testCases: [
      { id: 'basic', label: 'Classic 7-Node Tree', input: { root: { val: 4, left: { val: 2, left: { val: 1, left: null, right: null }, right: { val: 3, left: null, right: null } }, right: { val: 7, left: { val: 6, left: null, right: null }, right: { val: 9, left: null, right: null } } } }, expectedOutput: { val: 4, left: { val: 7, left: { val: 9, left: null, right: null }, right: { val: 6, left: null, right: null } }, right: { val: 2, left: { val: 3, left: null, right: null }, right: { val: 1, left: null, right: null } } }, hidden: false },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: null, hidden: false },
      { id: 'single', label: 'Single Node', input: { root: { val: 1, left: null, right: null } }, expectedOutput: { val: 1, left: null, right: null }, hidden: true },
      { id: 'left-only', label: 'Left Child Only', input: { root: { val: 1, left: { val: 2, left: null, right: null }, right: null } }, expectedOutput: { val: 1, left: null, right: { val: 2, left: null, right: null } }, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-3': {
    id: 'tree-bs-prob-3',
    title: 'Same Tree',
    difficulty: 'easy',
    topic: 'Trees / Binary Search',
    estimatedTime: '10–15 min',
    functionName: 'is_same_tree',
    functionSignature: 'is_same_tree(p: dict | None, q: dict | None) -> bool',
    starterCode: `def is_same_tree(p, q):
    """p, q: tree nodes as {'val', 'left', 'right'}, or None. Return True
    if the two trees are structurally identical AND every corresponding
    node holds the same value."""
    # Your implementation here
    pass
`,
    mission: 'Implement Same Tree -- structural equality between two trees, the base case every tree-comparison problem (symmetric trees, subtree matching) builds on.',
    taskDescription: 'Implement `is_same_tree(p, q)`: two empty trees are equal; a tree and an empty tree are never equal; two non-empty trees are equal exactly when their values match AND both pairs of children are (recursively) equal.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Two None trees are equal (both empty).',
      'A None tree and a non-None tree are never equal, regardless of the non-None tree\'s shape.',
    ],
    hints: {
      small: 'Handle the None/None and None/non-None cases first, then compare values and recurse into both pairs of children.',
      strong: 'if p is None and q is None: return True. if p is None or q is None: return False. return p["val"]==q["val"] and is_same_tree(p["left"],q["left"]) and is_same_tree(p["right"],q["right"]).',
      concept: 'This is the same recursive shape as Symmetric Tree below, just comparing two independent trees node-by-node instead of comparing one tree against its own mirror.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Paired tree recursion as the base pattern for tree-equality questions' },
    ],
    testCases: [
      { id: 'identical', label: 'Identical Trees', input: { p: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } }, q: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } } }, expectedOutput: true, hidden: false },
      { id: 'different-structure', label: 'Different Structure, Same Values', input: { p: { val: 1, left: { val: 2, left: null, right: null }, right: null }, q: { val: 1, left: null, right: { val: 2, left: null, right: null } } }, expectedOutput: false, hidden: false },
      { id: 'both-empty', label: 'Both Empty', input: { p: null, q: null }, expectedOutput: true, hidden: true },
      { id: 'one-empty', label: 'One Empty, One Not', input: { p: { val: 1, left: null, right: null }, q: null }, expectedOutput: false, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-4': {
    id: 'tree-bs-prob-4',
    title: 'Binary Search',
    difficulty: 'easy',
    topic: 'Trees / Binary Search',
    estimatedTime: '10–15 min',
    functionName: 'binary_search',
    functionSignature: 'binary_search(nums: list[int], target: int) -> int',
    starterCode: `def binary_search(nums, target):
    """nums: a list sorted in ascending order, all distinct values.
    Return the index of target in nums, or -1 if it is not present.
    Must run in O(log n) time."""
    # Your implementation here
    pass
`,
    mission: 'Implement classic binary search from scratch -- the O(log n) algorithm every tree-height-bounded search, and half of this track\'s own name, is built on.',
    taskDescription: 'Implement `binary_search(nums, target)`: maintain a shrinking [lo, hi] window; at each step compare target to the midpoint and discard the half that cannot contain it.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (e.g. the bisect module) are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'nums is sorted ascending with all distinct values.',
      'Must run in O(log n) time -- a linear scan does not satisfy the intended solution, even though it would give a correct answer.',
      'Return -1 if target is not present.',
    ],
    hints: {
      small: 'Keep a low and high boundary. Look at the middle element: if it is too small, the answer (if any) is to the right; if too big, to the left.',
      strong: 'lo, hi = 0, len(nums)-1. While lo <= hi: mid = (lo+hi)//2. If nums[mid]==target: return mid. elif nums[mid] < target: lo = mid+1. else: hi = mid-1. Return -1.',
      concept: 'The invariant "the answer, if it exists, is always within [lo, hi]" is what makes binary search correct -- every iteration either finds the target or provably shrinks that window by at least half, guaranteeing O(log n) iterations.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Classic binary search as the O(log n) foundation for sorted-array and BST algorithms alike' },
    ],
    testCases: [
      { id: 'found', label: 'Target Present', input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expectedOutput: 4, hidden: false },
      { id: 'not-found', label: 'Target Absent', input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expectedOutput: -1, hidden: false },
      { id: 'single-element-found', label: 'Single-Element List, Found', input: { nums: [5], target: 5 }, expectedOutput: 0, hidden: true },
      { id: 'empty', label: 'Empty List', input: { nums: [], target: 1 }, expectedOutput: -1, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-5': {
    id: 'tree-bs-prob-5',
    title: 'Binary Tree Inorder Traversal (Iterative)',
    difficulty: 'easy',
    topic: 'Trees / Binary Search',
    estimatedTime: '10–15 min',
    functionName: 'inorder_traversal',
    functionSignature: 'inorder_traversal(root: dict | None) -> list[int]',
    starterCode: `def inorder_traversal(root):
    """root: a tree node as {'val', 'left', 'right'}, or None. Return the
    node values in inorder (left, root, right) order, using an explicit
    stack -- NOT recursion."""
    # Your implementation here
    pass
`,
    mission: 'Implement inorder traversal iteratively with an explicit stack -- the real interview follow-up to "now do it without recursion," and the traversal order that visits a BST\'s values in sorted order.',
    taskDescription: 'Implement `inorder_traversal(root)`: push every left-child chain onto a stack, then each time you pop a node, record its value and move to its right child (repeating the left-chain push from there).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Must use an explicit stack, not recursion (the recursive version is easy -- this exercise is specifically about the iterative one).',
      'An empty tree produces an empty list.',
    ],
    hints: {
      small: 'Keep pushing left children onto a stack until you hit None; then pop one, record it, and switch to exploring its right child the same way.',
      strong: 'stack = []; cur = root; result = []. While cur is not None or stack: while cur is not None: stack.append(cur); cur = cur["left"]. cur = stack.pop(); result.append(cur["val"]); cur = cur["right"].',
      concept: 'This iterative pattern (push left-chain, pop-and-go-right) is the standard translation of ANY tree recursion into an explicit-stack loop -- the stack is doing exactly what the call stack would have done for you automatically in the recursive version.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Explicit-stack simulation of recursive tree traversal' },
    ],
    testCases: [
      { id: 'basic', label: 'Right-Leaning With a Left Grandchild', input: { root: { val: 1, left: null, right: { val: 2, left: { val: 3, left: null, right: null }, right: null } } }, expectedOutput: [1, 3, 2], hidden: false },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: [], hidden: false },
      { id: 'full-small-tree', label: 'Full 5-Node Tree', input: { root: { val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: null, right: null } } }, expectedOutput: [4, 2, 5, 1, 3], hidden: true },
      { id: 'single', label: 'Single Node', input: { root: { val: 7, left: null, right: null } }, expectedOutput: [7], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-11': {
    id: 'tree-bs-prob-11',
    title: 'Symmetric Tree',
    difficulty: 'medium',
    topic: 'Trees / Binary Search',
    estimatedTime: '15–20 min',
    functionName: 'is_symmetric',
    functionSignature: 'is_symmetric(root: dict | None) -> bool',
    starterCode: `def is_symmetric(root):
    """root: a tree node as {'val', 'left', 'right'}, or None. Return
    True if the tree is a mirror image of itself around its center
    (root's left subtree is a mirror of its right subtree)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Symmetric Tree -- comparing a tree against its OWN mirror, via a paired recursion that walks two subtrees in opposite directions simultaneously.',
    taskDescription: "Implement `is_symmetric(root)`: an empty tree is trivially symmetric. Otherwise, check whether root's left and right subtrees are mirror images of each other -- a helper comparing two subtrees where you recurse left-vs-right AND right-vs-left.",
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'An empty tree is symmetric.',
      'Two nodes are mirror-matched only if their values are equal AND (left of one mirrors right of the other) AND (right of one mirrors left of the other).',
    ],
    hints: {
      small: 'Write a helper that checks whether two subtrees are mirror images of EACH OTHER (not whether they are equal to each other) -- it recurses a\'s left against b\'s right, and a\'s right against b\'s left.',
      strong: 'def mirror(a, b): if a is None and b is None: return True. if a is None or b is None: return False. return a["val"]==b["val"] and mirror(a["left"],b["right"]) and mirror(a["right"],b["left"]). Then is_symmetric(root) = root is None or mirror(root["left"], root["right"]).',
      concept: 'The key difference from Same Tree is which children get compared to which: Same Tree compares left-to-left and right-to-right (identical structure), while mirror-checking compares left-to-right and right-to-left (reflected structure).',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Paired, cross-wired recursion for mirror/reflection structural checks' },
    ],
    testCases: [
      { id: 'symmetric', label: 'Symmetric Tree', input: { root: { val: 1, left: { val: 2, left: { val: 3, left: null, right: null }, right: { val: 4, left: null, right: null } }, right: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 3, left: null, right: null } } } }, expectedOutput: true, hidden: false },
      { id: 'not-symmetric', label: 'Not Symmetric', input: { root: { val: 1, left: { val: 2, left: null, right: { val: 3, left: null, right: null } }, right: { val: 2, left: null, right: { val: 3, left: null, right: null } } } }, expectedOutput: false, hidden: false, description: 'Both 3s are on the same (right) side -- not a mirror' },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: true, hidden: true },
      { id: 'single', label: 'Single Node', input: { root: { val: 1, left: null, right: null } }, expectedOutput: true, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-12': {
    id: 'tree-bs-prob-12',
    title: 'Kth Smallest Element in a BST',
    difficulty: 'medium',
    topic: 'Trees / Binary Search',
    estimatedTime: '15–20 min',
    functionName: 'kth_smallest_in_bst',
    functionSignature: 'kth_smallest_in_bst(root: dict | None, k: int) -> int',
    starterCode: `def kth_smallest_in_bst(root, k):
    """root: the root of a valid BST, as {'val', 'left', 'right'}. k: a
    1-indexed rank (k=1 means the smallest value). Return the kth
    smallest value in the tree. Raise ValueError if k exceeds the number
    of nodes."""
    # Your implementation here
    pass
`,
    mission: 'Implement Kth Smallest Element in a BST by exploiting the single most useful BST property: an inorder traversal visits every value in ascending sorted order, for free.',
    taskDescription: 'Implement `kth_smallest_in_bst(root, k)`: run an inorder traversal (iterative, with an early stop once you have counted k values), and return the kth value visited.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'k is 1-indexed: k=1 is the smallest value in the tree.',
      'Raise ValueError if k is larger than the number of nodes in the tree.',
      'Stop the traversal as soon as the kth value is found -- do not needlessly visit the rest of the tree.',
    ],
    hints: {
      small: 'An inorder traversal of a BST visits values in sorted order -- you just need to count as you go and stop at the kth one.',
      strong: 'Use the iterative inorder stack pattern; each time you pop a node, increment a counter and return its value the moment the counter reaches k.',
      concept: 'This is exactly why the BST invariant (left < node < right, everywhere) is valuable -- it turns "find the kth smallest" from a full-tree sort into a single early-terminating traversal.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'The BST inorder-traversal-is-sorted-order property applied to rank queries' },
    ],
    testCases: [
      { id: 'smallest', label: 'k=1 (Smallest)', input: { root: { val: 3, left: { val: 1, left: null, right: { val: 2, left: null, right: null } }, right: { val: 4, left: null, right: null } }, k: 1 }, expectedOutput: 1, hidden: false },
      { id: 'largest', label: 'k=3 (Largest of 3-Node Left Subtree)', input: { root: { val: 3, left: { val: 1, left: null, right: { val: 2, left: null, right: null } }, right: { val: 4, left: null, right: null } }, k: 3 }, expectedOutput: 3, hidden: false },
      { id: 'k-too-large', label: 'k Exceeds Node Count', input: { root: { val: 1, left: null, right: null }, k: 2 }, expectError: 'ValueError', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-13': {
    id: 'tree-bs-prob-13',
    title: 'Search Insert Position',
    difficulty: 'medium',
    topic: 'Trees / Binary Search',
    estimatedTime: '15–20 min',
    functionName: 'search_insert',
    functionSignature: 'search_insert(nums: list[int], target: int) -> int',
    starterCode: `def search_insert(nums, target):
    """nums: sorted ascending, distinct values. Return the index of
    target if it is present; otherwise return the index where it would
    be inserted to keep nums sorted. Must run in O(log n) time."""
    # Your implementation here
    pass
`,
    mission: 'Implement Search Insert Position -- a small but important variant of binary search, where "not found" means something (the exact insertion point) instead of just -1.',
    taskDescription: 'Implement `search_insert(nums, target)`: binary search for the leftmost index where target could be inserted without breaking sort order (equivalently, the first index whose value is >= target).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (e.g. bisect.bisect_left) are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Must run in O(log n) time.',
      'If target already exists in nums, return its index.',
      'If target is larger than every element, the correct answer is len(nums).',
    ],
    hints: {
      small: 'You are looking for the first position where a value >= target could sit -- binary search on that condition directly, rather than searching for an exact match first.',
      strong: 'lo, hi = 0, len(nums). While lo < hi: mid = (lo+hi)//2. If nums[mid] < target: lo = mid+1. else: hi = mid. Return lo.',
      concept: 'This "binary search for the boundary of a condition" template (searching a half-open [lo, hi) range that shrinks to a single answer) is more broadly useful than search-for-an-exact-value binary search -- Search Range below uses the exact same template twice.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Binary search for a boundary/insertion point, not just an exact match' },
    ],
    testCases: [
      { id: 'present', label: 'Target Present', input: { nums: [1, 3, 5, 6], target: 5 }, expectedOutput: 2, hidden: false },
      { id: 'insert-middle', label: 'Insert in the Middle', input: { nums: [1, 3, 5, 6], target: 2 }, expectedOutput: 1, hidden: false },
      { id: 'insert-end', label: 'Insert at the End', input: { nums: [1, 3, 5, 6], target: 7 }, expectedOutput: 4, hidden: true },
      { id: 'insert-start', label: 'Insert at the Start', input: { nums: [1, 3, 5, 6], target: 0 }, expectedOutput: 0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-14': {
    id: 'tree-bs-prob-14',
    title: 'Find First and Last Position of Element in Sorted Array',
    difficulty: 'medium',
    topic: 'Trees / Binary Search',
    estimatedTime: '15–20 min',
    functionName: 'search_range',
    functionSignature: 'search_range(nums: list[int], target: int) -> list[int]',
    starterCode: `def search_range(nums, target):
    """nums: sorted ascending, may contain duplicates. Return [first,
    last] -- the indices of target's first and last occurrence -- or
    [-1, -1] if target is not present. Must run in O(log n) time."""
    # Your implementation here
    pass
`,
    mission: 'Implement Find First and Last Position -- two binary searches for two different boundaries (the leftmost and rightmost occurrence of a repeated value), the classic real use case for duplicate-tolerant binary search.',
    taskDescription: 'Implement `search_range(nums, target)`: run one binary search biased to keep shrinking left after finding a match (to find the FIRST occurrence), and a second biased to keep shrinking right (to find the LAST occurrence).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries (e.g. bisect) are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Must run in O(log n) time -- a linear scan through duplicates does not satisfy the intended solution.',
      'Return [-1, -1] if target does not appear anywhere in nums.',
    ],
    hints: {
      small: 'Write one binary search helper that finds a boundary, parameterized by "keep searching left after a match" vs "keep searching right after a match" -- call it twice.',
      strong: 'For the first-occurrence search: on a match, record the index and continue searching the LEFT half (hi = mid-1). For the last-occurrence search: on a match, record the index and continue searching the RIGHT half (lo = mid+1).',
      concept: 'A single "found a match, but keep searching for a BETTER match on one specific side" binary search is the general template for boundary-finding problems -- Search Insert Position above is the special case where the boundary is defined by "value >= target" rather than "value == target."',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Two-directional boundary binary search for the range of a repeated value' },
    ],
    testCases: [
      { id: 'found-range', label: 'Multiple Occurrences', input: { nums: [5, 7, 7, 8, 8, 10], target: 8 }, expectedOutput: [3, 4], hidden: false },
      { id: 'not-found', label: 'Target Absent', input: { nums: [5, 7, 7, 8, 8, 10], target: 6 }, expectedOutput: [-1, -1], hidden: false },
      { id: 'empty', label: 'Empty Array', input: { nums: [], target: 0 }, expectedOutput: [-1, -1], hidden: true },
      { id: 'single-occurrence', label: 'Exactly One Occurrence', input: { nums: [1, 2, 3], target: 2 }, expectedOutput: [1, 1], hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-15': {
    id: 'tree-bs-prob-15',
    title: 'Path Sum',
    difficulty: 'medium',
    topic: 'Trees / Binary Search',
    estimatedTime: '15–20 min',
    functionName: 'has_path_sum',
    functionSignature: 'has_path_sum(root: dict | None, target_sum: int) -> bool',
    starterCode: `def has_path_sum(root, target_sum):
    """root: a tree node as {'val', 'left', 'right'}, or None.
    target_sum: an integer. Return True if some ROOT-TO-LEAF path exists
    whose node values sum to exactly target_sum. An empty tree has no
    such path (always False, even if target_sum is 0)."""
    # Your implementation here
    pass
`,
    mission: 'Implement Path Sum -- a root-to-leaf-only search (not any path between any two nodes, which is the much harder Maximum Path Sum problem below) that carries a shrinking "remaining budget" down the recursion.',
    taskDescription: 'Implement `has_path_sum(root, target_sum)`: at a leaf, check whether its value equals whatever sum is still needed; at an internal node, subtract its value from the target and recurse into whichever child(ren) exist.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'A path must run from the root all the way down to a LEAF (a node with no children) -- stopping partway does not count.',
      'An empty tree always returns False, even if target_sum happens to be 0.',
    ],
    hints: {
      small: 'Carry the "remaining amount needed" down the recursion, subtracting the current node\'s value at each step; check the remaining amount against the leaf\'s own value once you reach one.',
      strong: 'if root is None: return False. if root["left"] is None and root["right"] is None: return root["val"] == target_sum. remaining = target_sum - root["val"]. return has_path_sum(root["left"], remaining) or has_path_sum(root["right"], remaining).',
      concept: 'The leaf check must come before the general recursive case -- without it, a leaf would incorrectly recurse into two None children and (per the empty-tree rule) return False or True depending on which OR-branch happens to short-circuit, rather than correctly checking whether ITS OWN value completes the path.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Root-to-leaf accumulator recursion, threading state down instead of aggregating up' },
    ],
    testCases: [
      { id: 'has-path', label: 'A Matching Root-to-Leaf Path Exists', input: { root: { val: 5, left: { val: 4, left: { val: 11, left: { val: 7, left: null, right: null }, right: { val: 2, left: null, right: null } }, right: null }, right: { val: 8, left: { val: 13, left: null, right: null }, right: { val: 4, left: null, right: { val: 1, left: null, right: null } } } }, target_sum: 22 }, expectedOutput: true, hidden: false, description: 'Path 5 -> 4 -> 11 -> 2 sums to 22' },
      { id: 'no-path', label: 'No Path Matches', input: { root: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } }, target_sum: 5 }, expectedOutput: false, hidden: false },
      { id: 'empty-tree', label: 'Empty Tree', input: { root: null, target_sum: 0 }, expectedOutput: false, hidden: true, description: 'An empty tree has no root-to-leaf path at all, even for target 0' },
      { id: 'single-node-match', label: 'Single Node That Matches', input: { root: { val: 7, left: null, right: null }, target_sum: 7 }, expectedOutput: true, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-16': {
    id: 'tree-bs-prob-16',
    title: 'Diameter of Binary Tree',
    difficulty: 'medium',
    topic: 'Trees / Binary Search',
    estimatedTime: '15–20 min',
    functionName: 'diameter_of_binary_tree',
    functionSignature: 'diameter_of_binary_tree(root: dict | None) -> int',
    starterCode: `def diameter_of_binary_tree(root):
    """root: a tree node as {'val', 'left', 'right'}, or None. Return
    the length (number of EDGES, not nodes) of the longest path between
    any two nodes in the tree -- this path may or may not pass through
    the root."""
    # Your implementation here
    pass
`,
    mission: 'Implement Diameter of Binary Tree -- the classic "compute a global answer while also computing a per-node height" problem, solved in one pass by updating a running best as a side effect of the height recursion.',
    taskDescription: 'Implement `diameter_of_binary_tree(root)`: while computing each node\'s height (for the return value), also update a running "best diameter seen so far" using that node\'s left-height + right-height (the longest path THROUGH this node).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'The diameter is measured in EDGES, not nodes -- a 2-node tree has diameter 1, not 2.',
      'The longest path does not need to pass through the root -- it could be entirely within one subtree.',
      'Must run in O(n) time (a naive "recompute height from scratch at every node" approach is O(n^2)).',
    ],
    hints: {
      small: 'At every node, the longest path passing THROUGH that node is (height of its left subtree) + (height of its right subtree) -- track the best of these across all nodes as you compute heights.',
      strong: 'best = [0]; def height(node): if node is None: return 0; lh = height(node["left"]); rh = height(node["right"]); best[0] = max(best[0], lh+rh); return 1+max(lh,rh). Call height(root) once, return best[0].',
      concept: 'Computing height and diameter in the SAME single pass (rather than a separate O(n) height computation at every one of the n nodes) is what keeps this O(n) instead of O(n^2) -- the height recursion you need anyway is repurposed to also update the diameter as a side effect.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Single-pass height computation with a side-effect running maximum' },
    ],
    testCases: [
      { id: 'basic', label: 'Classic 5-Node Tree', input: { root: { val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: null, right: null } } }, expectedOutput: 3, hidden: false, description: 'Longest path 4-2-1-3 or 5-2-1-3, 3 edges' },
      { id: 'two-node', label: 'Two-Node Tree', input: { root: { val: 1, left: { val: 2, left: null, right: null }, right: null } }, expectedOutput: 1, hidden: false },
      { id: 'single-node', label: 'Single Node', input: { root: { val: 1, left: null, right: null } }, expectedOutput: 0, hidden: true },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: 0, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-21': {
    id: 'tree-bs-prob-21',
    title: 'Balanced Binary Tree',
    difficulty: 'hard',
    topic: 'Trees / Binary Search',
    estimatedTime: '20–25 min',
    functionName: 'is_balanced',
    functionSignature: 'is_balanced(root: dict | None) -> bool',
    starterCode: `def is_balanced(root):
    """root: a tree node as {'val', 'left', 'right'}, or None. Return
    True if the tree is height-balanced: for EVERY node, the heights of
    its left and right subtrees differ by at most 1. Must run in O(n)
    time (not O(n^2))."""
    # Your implementation here
    pass
`,
    mission: 'Implement Balanced Binary Tree with a single O(n) pass that short-circuits on the first imbalance found, rather than the naive O(n^2) approach of separately computing height at every node.',
    taskDescription: 'Implement `is_balanced(root)`: write a helper that returns a subtree\'s height as normal, but returns a sentinel value (e.g. -1) the moment ANY imbalance is detected anywhere below -- and propagate that sentinel straight up without doing any more work.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'Balance is a GLOBAL property: every single node in the tree must satisfy the height-difference-at-most-1 rule, not just the root.',
      'Must run in O(n) time -- computing height fresh at every node (O(n) work times n nodes) does not satisfy the intended solution.',
      'An empty tree is trivially balanced.',
    ],
    hints: {
      small: 'Instead of computing height and checking balance as two separate passes, make your height-computing function also detect and report imbalance as it goes -- e.g. by returning -1 as a "found an imbalance, stop everything" signal.',
      strong: 'def check(node): if node is None: return 0. lh = check(node["left"]); if lh == -1: return -1. rh = check(node["right"]); if rh == -1: return -1. if abs(lh-rh) > 1: return -1. return 1+max(lh,rh). is_balanced(root) = check(root) != -1.',
      concept: 'Once ANY subtree reports -1, every ancestor above it just passes that -1 straight up without doing any further comparison work -- this early-exit propagation is what keeps the whole check at O(n) instead of O(n^2), since no node ever has its height recomputed by an ancestor.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Sentinel-value early-exit propagation for an O(n) global tree property check' },
    ],
    testCases: [
      { id: 'balanced', label: 'Balanced Tree', input: { root: { val: 3, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } } }, expectedOutput: true, hidden: false },
      { id: 'unbalanced', label: 'Unbalanced Tree', input: { root: { val: 1, left: { val: 2, left: { val: 3, left: { val: 4, left: null, right: null }, right: { val: 4, left: null, right: null } }, right: { val: 3, left: null, right: null } }, right: { val: 2, left: null, right: null } } }, expectedOutput: false, hidden: false },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: true, hidden: true },
      { id: 'single', label: 'Single Node', input: { root: { val: 1, left: null, right: null } }, expectedOutput: true, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-22': {
    id: 'tree-bs-prob-22',
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    difficulty: 'hard',
    topic: 'Trees / Binary Search',
    estimatedTime: '20–25 min',
    functionName: 'build_tree_from_traversals',
    functionSignature: 'build_tree_from_traversals(preorder: list[int], inorder: list[int]) -> dict | None',
    starterCode: `def build_tree_from_traversals(preorder, inorder):
    """preorder, inorder: the preorder and inorder traversals of the SAME
    binary tree (all values distinct). Reconstruct and return the tree
    as {'val', 'left', 'right'} nodes (None for an absent child, or for
    an empty tree)."""
    # Your implementation here
    pass
`,
    mission: 'Implement tree reconstruction from preorder + inorder traversals -- using the fact that preorder always names the current subtree\'s root FIRST, and inorder then tells you exactly how many of the remaining values belong to the left vs. right subtree.',
    taskDescription: 'Implement `build_tree_from_traversals(preorder, inorder)`: the first unused value in preorder is always the current subtree\'s root; find that value\'s position in the current inorder slice to know how many values go left (everything before it) and how many go right (everything after), then recurse.',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'All node values are distinct (no duplicate values to disambiguate).',
      'Precompute a value -> inorder-index lookup map before recursing, so each root lookup is O(1) instead of an O(n) scan (keeping the whole reconstruction O(n) instead of O(n^2)).',
    ],
    hints: {
      small: 'preorder\'s very next unused value is always the root of whatever subtree you are currently building -- everything is about figuring out where that value splits the current inorder range into "left subtree values" and "right subtree values."',
      strong: 'Build inorder_index = {val: i for i, val in enumerate(inorder)}. Use an iterator over preorder. Recursive build(in_left, in_right): if in_left > in_right: return None. root_val = next(preorder_iter). idx = inorder_index[root_val]. Build left from (in_left, idx-1), then right from (idx+1, in_right) -- left MUST be built before right, since they share one preorder iterator consumed in that exact order.',
      concept: 'The order of the two recursive calls matters here in a way it usually does not: preorder visits root, then ALL of the left subtree, then ALL of the right subtree -- so the shared preorder iterator must be advanced through the entire left subtree\'s construction before the right subtree\'s root is even read.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Reconstructing a tree from two of its traversal orders via a hash-map index' },
    ],
    testCases: [
      { id: 'classic', label: 'Classic 5-Node Example', input: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] }, expectedOutput: { val: 3, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } }, hidden: false },
      { id: 'single-node', label: 'Single Node', input: { preorder: [1], inorder: [1] }, expectedOutput: { val: 1, left: null, right: null }, hidden: false },
      { id: 'left-only-chain', label: 'Entirely Left-Leaning Chain', input: { preorder: [3, 2, 1], inorder: [1, 2, 3] }, expectedOutput: { val: 3, left: { val: 2, left: { val: 1, left: null, right: null }, right: null }, right: null }, hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-23': {
    id: 'tree-bs-prob-23',
    title: 'Serialize a Binary Tree (Preorder Encoding)',
    difficulty: 'hard',
    topic: 'Trees / Binary Search',
    estimatedTime: '20–25 min',
    functionName: 'serialize_tree',
    functionSignature: 'serialize_tree(root: dict | None) -> str',
    starterCode: `def serialize_tree(root):
    """root: a tree node as {'val', 'left', 'right'}, or None. Return a
    single comma-separated string encoding of the tree, built from a
    PREORDER traversal where every None child is written as the literal
    string '#' (so the shape of the tree is fully recoverable from the
    string alone, not just its values)."""
    # Your implementation here
    pass
`,
    mission: 'Implement the preorder-with-null-markers encoding scheme behind LeetCode\'s classic "Serialize and Deserialize Binary Tree" -- the same trick real systems use to flatten a tree into a string/byte stream that unambiguously reconstructs the exact original shape.',
    taskDescription: "Implement `serialize_tree(root)`: perform a preorder (root, left, right) traversal, appending each node's value as a string, and appending the literal string '#' wherever a child is None. Join everything with commas.",
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      "Traversal order is preorder: current node's value first, then its ENTIRE left subtree's encoding, then its ENTIRE right subtree's encoding.",
      "Every None child must be written as the literal string '#' -- omitting nulls would make the shape ambiguous (a value with no right child would be indistinguishable from one with no left child).",
      'An empty tree (root is None) encodes as just the string "#".',
    ],
    hints: {
      small: "Walk the tree exactly like a normal preorder traversal, but every time you would recurse into a None child, write the placeholder '#' into your output instead of skipping it.",
      strong: 'parts = []; def dfs(node): if node is None: parts.append("#"); return. parts.append(str(node["val"])); dfs(node["left"]); dfs(node["right"]). Call dfs(root), then return ",".join(parts).',
      concept: 'Explicitly recording every null (rather than just the values that exist) is what makes this reversible: without the null markers, a preorder value sequence like [1, 2, 3] could describe several different tree SHAPES with those same three values, not just one.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Preorder-with-null-markers as a canonical, reversible tree-to-string encoding' },
    ],
    testCases: [
      { id: 'basic', label: 'Small Tree With a Right Subtree', input: { root: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } } } }, expectedOutput: '1,2,#,#,3,4,#,#,5,#,#', hidden: false },
      { id: 'empty', label: 'Empty Tree', input: { root: null }, expectedOutput: '#', hidden: false },
      { id: 'single', label: 'Single Node', input: { root: { val: 1, left: null, right: null } }, expectedOutput: '1,#,#', hidden: true },
    ],
    runtime: { language: 'python', capabilities: ['python'] },
  },
  'tree-bs-prob-24': {
    id: 'tree-bs-prob-24',
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'hard',
    topic: 'Trees / Binary Search',
    estimatedTime: '25–30 min',
    functionName: 'max_path_sum',
    functionSignature: 'max_path_sum(root: dict) -> int',
    starterCode: `def max_path_sum(root):
    """root: a non-empty tree node as {'val', 'left', 'right'}. A path
    is any sequence of nodes connected by edges, and does NOT need to
    pass through the root or end at a leaf -- it may start and end at
    any two nodes (or be a single node). Return the maximum possible
    sum of node values along any such path. Node values may be
    negative."""
    # Your implementation here
    pass
`,
    mission: 'Implement Binary Tree Maximum Path Sum -- one of the most-cited "hard" tree problems, requiring you to track two DIFFERENT quantities at each node: the best path usable by an ancestor (one-sided) vs. the best path THROUGH this node (both sides, only valid as a final answer here).',
    taskDescription: 'Implement `max_path_sum(root)`: for each node, compute the best "downward" gain from each child (clamped to 0, since a negative-sum branch should just be excluded rather than dragging the total down), use both children\'s gains together to update a global best (a path bending through this node), but RETURN to the caller only this node\'s value plus the better of its two one-sided child gains (since a path continuing upward through an ancestor can only use one branch, not both).',
    libraryPolicyText: 'Libraries allowed · Pure Python earns +10 bonus XP',
    bonusPoints: 10,
    bonusDescription: 'Pure Python implementation',
    constraints: [
      'Libraries are allowed and accepted normally; Pure Python earns +10 Bonus XP!',
      'A path does not need to pass through the root, and does not need to end at a leaf -- any two nodes (or a single node) qualify.',
      'Node values may be negative -- clamp a child\'s contribution to 0 rather than including a net-negative branch.',
      'The tree is never empty for this problem.',
    ],
    hints: {
      small: "Separate two ideas clearly: (1) the best score achievable by continuing a path UPWARD through this node into its parent (can only use ONE child branch, or neither), vs. (2) the best score of a path that BENDS at this node, using BOTH children (only valid as a global answer, never returned upward).",
      strong: 'best = [-inf]; def gain(node): if node is None: return 0. lg = max(gain(node["left"]), 0); rg = max(gain(node["right"]), 0); best[0] = max(best[0], node["val"]+lg+rg); return node["val"] + max(lg, rg). Call gain(root), return best[0].',
      concept: 'The function\'s RETURN value and the GLOBAL best being tracked are answering two different questions -- conflating them (e.g. returning node["val"]+lg+rg instead of node["val"]+max(lg,rg)) would let an ancestor illegally use both of this node\'s branches as if they were a single continuous path.',
    },
    conceptConnections: [
      { title: 'General Coding (DSA)', route: '/docs/interview-prep/dsa-coding', description: 'Tracking a one-sided return value separately from a global best via a side-channel accumulator' },
    ],
    testCases: [
      { id: 'simple-positive', label: 'Small All-Positive Tree', input: { root: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } } }, expectedOutput: 6, hidden: false, description: 'Path 2 -> 1 -> 3' },
      { id: 'with-negative-root', label: 'Negative Root, Path Excludes It', input: { root: { val: -10, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } } }, expectedOutput: 42, hidden: false, description: 'Path 15 -> 20 -> 7, entirely avoiding the negative root' },
      { id: 'single-negative-node', label: 'Single Negative Node', input: { root: { val: -3, left: null, right: null } }, expectedOutput: -3, hidden: true, description: 'With only one node, the best path is that node itself, even though it is negative' },
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

