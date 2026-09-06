import http from 'node:http';
import { spawn } from 'node:child_process';
import { Buffer } from 'node:buffer';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const MAX_STDOUT_BYTES = 64 * 1024; // 64 KB stdout limit
const EXECUTION_TIMEOUT_MS = 5000; // 5 seconds CPU/wall time timeout

/**
 * Builds the Python wrapper script that injects test cases, sets up stdout capturing,
 * executes user code, and returns JSON-formatted test case results.
 */
function buildPythonHarness(code, functionName, testCases) {
  return `
import sys
import io
import json
import time
import traceback

# Security restriction: prevent direct process exit hacks
def _blocked_exit(*args, **kwargs):
    raise RuntimeError("sys.exit() is disabled in sandbox")
sys.exit = _blocked_exit

class CappedStringIO:
    def __init__(self, limit=64*1024):
        self.buf = io.StringIO()
        self.limit = limit
        self.size = 0
        self.truncated = False
    def write(self, s):
        if self.size < self.limit:
            remaining = self.limit - self.size
            chunk = s[:remaining]
            self.buf.write(chunk)
            self.size += len(chunk)
            if len(s) > remaining:
                self.truncated = True
        else:
            self.truncated = True
    def flush(self):
        self.buf.flush()
    def getvalue(self):
        val = self.buf.getvalue()
        if self.truncated:
            val += "\\n[Output truncated: exceeded 64 KB limit]"
        return val

_user_code = ${JSON.stringify(code)}
_function_name = ${JSON.stringify(functionName)}
_test_cases = json.loads(${JSON.stringify(JSON.stringify(testCases))})

_stdout_capture = CappedStringIO()
_orig_stdout = sys.stdout
sys.stdout = _stdout_capture

_setup_error = None
_case_results = []

_global_scope = {}

try:
    exec(_user_code, _global_scope)
except Exception as e:
    _setup_error = traceback.format_exc()

if _setup_error is None:
    if _function_name not in _global_scope:
        _setup_error = f"Function '{_function_name}' was not defined in implementation."
    elif not callable(_global_scope[_function_name]):
        _setup_error = f"'{_function_name}' is not callable."

if _setup_error is None:
    _fn = _global_scope[_function_name]
    for tc in _test_cases:
        tc_id = tc.get("id", "case")
        kwargs = tc.get("input", {})
        expected = tc.get("expectedOutput")
        expect_err = tc.get("expectError")
        
        t0 = time.perf_counter()
        passed = False
        actual = None
        err_msg = None
        
        try:
            actual = _fn(**kwargs)
            t_diff = (time.perf_counter() - t0) * 1000.0
            
            if expect_err:
                passed = False
                err_msg = f"Expected error matching '{expect_err}' but function executed successfully."
            else:
                passed = (actual == expected)
        except Exception as case_exc:
            t_diff = (time.perf_counter() - t0) * 1000.0
            err_str = traceback.format_exc()
            if expect_err and expect_err.lower() in err_str.lower():
                passed = True
            else:
                passed = False
                err_msg = err_str
                
        _case_results.append({
            "id": tc_id,
            "passed": passed,
            "actualOutput": actual,
            "error": err_msg,
            "executionTimeMs": round(t_diff, 2)
        })

sys.stdout = _orig_stdout
_stdout_str = _stdout_capture.getvalue()

output_obj = {
    "setupError": _setup_error,
    "stdout": _stdout_str,
    "caseResults": _case_results
}

print("===JSON_START===")
print(json.dumps(output_obj))
print("===JSON_END===")
`;
}

/**
 * Runs Python code inside hardened Docker sandbox container.
 */
function runInDockerSandbox(pythonScript) {
  return new Promise((resolve) => {
    const dockerArgs = [
      'run',
      '--rm',
      '-i',
      '--network', 'none',
      '--memory', '128m',
      '--memory-swap', '128m',
      '--cpus', '0.5',
      '--pids-limit', '64',
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=16m',
      '--security-opt', 'no-new-privileges:true',
      '--cap-drop', 'ALL',
      'python:3.12-slim',
      'timeout', '5s',
      'python3',
      '-c',
      pythonScript,
    ];

    const proc = spawn('docker', dockerArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdoutBuffer = Buffer.alloc(0);
    let stderrBuffer = Buffer.alloc(0);
    let isTruncated = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, EXECUTION_TIMEOUT_MS + 1500);

    proc.stdout.on('data', (chunk) => {
      if (stdoutBuffer.length + chunk.length > MAX_STDOUT_BYTES) {
        isTruncated = true;
        const remaining = MAX_STDOUT_BYTES - stdoutBuffer.length;
        if (remaining > 0) stdoutBuffer = Buffer.concat([stdoutBuffer, chunk.subarray(0, remaining)]);
        proc.kill('SIGKILL');
      } else {
        stdoutBuffer = Buffer.concat([stdoutBuffer, chunk]);
      }
    });

    proc.stderr.on('data', (chunk) => {
      if (stderrBuffer.length + chunk.length > MAX_STDOUT_BYTES) {
        const remaining = MAX_STDOUT_BYTES - stderrBuffer.length;
        if (remaining > 0) stderrBuffer = Buffer.concat([stderrBuffer, chunk.subarray(0, remaining)]);
      } else {
        stderrBuffer = Buffer.concat([stderrBuffer, chunk]);
      }
    });

    proc.on('close', (code, signal) => {
      clearTimeout(timer);

      if (timedOut || code === 124) {
        return resolve({
          status: 'timeout',
          stdout: '',
          caseResults: [],
          errorMessage: `Execution timed out after ${EXECUTION_TIMEOUT_MS}ms (CPU/time ceiling reached).`,
        });
      }

      const rawStdout = stdoutBuffer.toString('utf-8');
      const rawStderr = stderrBuffer.toString('utf-8');

      // Check for OOM / Memory limit kill
      if (code === 137 || signal === 'SIGKILL') {
        if (isTruncated) {
          return resolve({
            status: 'runtime_error',
            stdout: rawStdout + '\n[Output truncated: exceeded 64 KB limit]',
            caseResults: [],
            errorMessage: 'Execution terminated: Output exceeded 64 KB stdout cap limit.',
          });
        }
        return resolve({
          status: 'runtime_error',
          stdout: rawStdout,
          caseResults: [],
          errorMessage: 'Execution terminated: Exceeded memory limit (128 MB RAM ceiling).',
        });
      }

      const jsonMatch = rawStdout.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (!jsonMatch) {
        const isSyntax = /SyntaxError|IndentationError/.test(rawStderr);
        return resolve({
          status: isSyntax ? 'syntax_error' : 'runtime_error',
          stdout: rawStdout,
          caseResults: [],
          errorMessage: rawStderr || `Python execution failed with exit code ${code}`,
        });
      }

      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const setupError = parsed.setupError;
        const caseResults = parsed.caseResults || [];

        let status = 'success';
        if (setupError) {
          status = /SyntaxError|IndentationError/.test(setupError) ? 'syntax_error' : 'runtime_error';
        } else if (caseResults.length === 0) {
          status = 'runtime_error';
        } else if (caseResults.every((c) => c.passed)) {
          status = 'success';
        } else if (caseResults.some((c) => c.error)) {
          status = 'runtime_error';
        } else {
          status = 'wrong_answer';
        }

        const totalExecutionTimeMs = caseResults.reduce((acc, c) => acc + (c.executionTimeMs || 0), 0);

        resolve({
          status,
          stdout: (parsed.stdout || '') + (isTruncated ? '\n[Output truncated: exceeded 64 KB limit]' : ''),
          caseResults,
          errorMessage: setupError,
          totalExecutionTimeMs,
        });
      } catch (err) {
        resolve({
          status: 'runtime_error',
          stdout: rawStdout,
          caseResults: [],
          errorMessage: `Failed to parse container output: ${err.message}`,
        });
      }
    });
  });
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST' || (req.url !== '/api/execute' && req.url !== '/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1024 * 1024) {
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      const { code, functionName, testCases } = payload;

      if (!code || !functionName || !Array.isArray(testCases)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid payload: required code, functionName, and testCases array' }));
      }

      const pythonScript = buildPythonHarness(code, functionName, testCases);
      const result = await runInDockerSandbox(pythonScript);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Internal server error: ${err.message}` }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[SandboxServer] Docker execution server listening on http://localhost:${PORT}`);
});
