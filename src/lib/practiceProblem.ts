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
};

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
