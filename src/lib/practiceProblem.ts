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

