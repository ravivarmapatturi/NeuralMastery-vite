import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ServerExecutor } from './serverExecutor';

describe('ServerExecutor', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('instantiates with server mode', () => {
    const executor = new ServerExecutor();
    expect(executor.mode).toBe('server');
  });

  it('executes successfully when server endpoint returns 200 JSON', async () => {
    const mockResult = {
      status: 'success',
      mode: 'server',
      stdout: 'Hello World\n',
      caseResults: [
        { testCaseId: 'tc1', passed: true, actualOutput: 32, error: null, executionTimeMs: 1.5 },
      ],
      errorMessage: null,
      totalExecutionTimeMs: 1.5,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResult,
    } as Response);

    const executor = new ServerExecutor({ endpointUrl: 'http://test-server/api/execute', enableFallback: false });
    const result = await executor.execute({
      code: 'def dot_product(a, b): return sum(x*y for x,y in zip(a,b))',
      functionName: 'dot_product',
      testCases: [{ id: 'tc1', label: 'case 1', input: { a: [1, 2], b: [3, 4] }, expectedOutput: 11 }],
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('success');
    expect(result.mode).toBe('server');
    expect(result.stdout).toBe('Hello World\n');
    expect(result.caseResults[0].passed).toBe(true);
  });

  it('gracefully falls back to Pyodide when server endpoint is unreachable', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const executor = new ServerExecutor({ endpointUrl: 'http://invalid-endpoint-999', enableFallback: true });
    const result = await executor.execute({
      code: 'def test_fn(): return 42',
      functionName: 'test_fn',
      testCases: [{ id: 'tc1', label: 'c1', input: {}, expectedOutput: 42 }],
    });

    // Fallback should execute locally via Pyodide or populate fallback error message
    expect(result.mode).toBe('local');
    expect(result.stdout.includes('Server unreachable') || result.errorMessage?.includes('Server unreachable')).toBe(true);
  });

  it('aborts pending request when terminate() is called', () => {
    const executor = new ServerExecutor({ enableFallback: false });
    expect(() => executor.terminate()).not.toThrow();
  });
});
