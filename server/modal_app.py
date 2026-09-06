"""
Modal serverless execution backend for Neural Mastery platform (neuralmasteryai.com).
Runs untrusted user Python code in Modal's gVisor container sandbox at zero ongoing cost.
Free Tier: Modal provides $30/month free compute credits (~30,000 runs/month).

Deploy with: modal deploy server/modal_app.py
"""

import modal
import json
import time
import sys
import io
import traceback

app = modal.App("neural-mastery-executor")
image = modal.Image.debian_slim(python_version="3.12").pip_install("numpy", "scipy")

MAX_STDOUT_BYTES = 64 * 1024  # 64 KB limit

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
            val += "\n[Output truncated: exceeded 64 KB limit]"
        return val

@app.function(
    image=image,
    cpu=0.5,
    memory=128,
    timeout=5,
    container_idle_timeout=60,
)
@modal.web_endpoint(method="POST")
def execute_code(request: dict):
    code = request.get("code", "")
    function_name = request.get("functionName", "")
    test_cases = request.get("testCases", [])

    if not code or not function_name:
        return {"status": "runtime_error", "errorMessage": "Missing code or functionName"}

    stdout_capture = CappedStringIO()
    orig_stdout = sys.stdout
    sys.stdout = stdout_capture

    setup_error = None
    case_results = []
    global_scope = {}

    try:
        exec(code, global_scope)
    except Exception as e:
        setup_error = traceback.format_exc()

    if setup_error is None:
        if function_name not in global_scope:
            setup_error = f"Function '{function_name}' was not defined."
        elif not callable(global_scope[function_name]):
            setup_error = f"'{function_name}' is not callable."

    if setup_error is None:
        fn = global_scope[function_name]
        for tc in test_cases:
            tc_id = tc.get("id", "case")
            kwargs = tc.get("input", {})
            expected = tc.get("expectedOutput")
            expect_err = tc.get("expectError")

            t0 = time.perf_counter()
            passed = False
            actual = None
            err_msg = None

            try:
                actual = fn(**kwargs)
                t_diff = (time.perf_counter() - t0) * 1000.0
                if expect_err:
                    passed = False
                    err_msg = f"Expected error '{expect_err}' but function succeeded."
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

            case_results.append({
                "testCaseId": tc_id,
                "passed": passed,
                "actualOutput": actual,
                "error": err_msg,
                "executionTimeMs": round(t_diff, 2),
            })

    sys.stdout = orig_stdout
    stdout_str = stdout_capture.getvalue()

    if len(stdout_str) > MAX_STDOUT_BYTES:
        stdout_str = stdout_str[:MAX_STDOUT_BYTES] + "\n[Output truncated: exceeded 64 KB limit]"

    status = "success"
    if setup_error:
        status = "syntax_error" if ("SyntaxError" in setup_error or "IndentationError" in setup_error) else "runtime_error"
    elif not case_results:
        status = "runtime_error"
    elif all(c["passed"] for c in case_results):
        status = "success"
    elif any(c["error"] for c in case_results):
        status = "runtime_error"
    else:
        status = "wrong_answer"

    total_time = sum(c.get("executionTimeMs", 0) for c in case_results)

    return {
        "status": status,
        "mode": "server",
        "stdout": stdout_str,
        "caseResults": case_results,
        "errorMessage": setup_error,
        "totalExecutionTimeMs": total_time,
    }
