import http from 'node:http';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const SERVER_URL = 'http://localhost:3001/api/execute';

function postCode(code, functionName = 'test_fn', testCases = [{ id: 'tc1', input: {}, expectedOutput: true }]) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ code, functionName, testCases });
    const req = http.request(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runSecuritySuite() {
  console.log('====================================================');
  console.log('  STARTING CONTAINERIZED DOCKER SANDBOX SECURITY SUITE');
  console.log('====================================================\n');

  // Spawn local sandbox server if not already running
  let serverProcess = null;
  try {
    await postCode('def test_fn(): return True');
    console.log('[Test Harness] Sandbox server already running on port 3001.');
  } catch (err) {
    console.log('[Test Harness] Spawning sandbox server on port 3001...');
    serverProcess = spawn('node', ['server/sandbox-server.mjs'], { stdio: 'pipe' });
    await new Promise((r) => setTimeout(r, 1500));
  }

  try {
    // 1. Legitimate Function Baseline Verification
    console.log('Test 1: Legitimate function (Dot Product baseline)...');
    const res1 = await postCode(
      `def dot_product(a, b): return sum(x * y for x, y in zip(a, b))`,
      'dot_product',
      [{ id: 'c1', input: { a: [1, 2, 3], b: [4, 5, 6] }, expectedOutput: 32 }]
    );
    assert.equal(res1.status, 'success', `Expected success but got ${res1.status}: ${res1.errorMessage}`);
    assert.equal(res1.caseResults[0].passed, true);
    console.log('  ✔ PASS: Legitimate dot product executed successfully.\n');

    // 2. Infinite Loop Attack
    console.log('Test 2: Infinite Loop Attack (`while True: pass`)...');
    const t0 = Date.now();
    const res2 = await postCode(`def test_fn():\n    while True: pass`, 'test_fn');
    const duration = Date.now() - t0;
    console.log('[Debug Test 2 Response]', res2);
    assert.equal(res2.status, 'timeout', `Expected timeout status, got ${res2.status}: ${res2.errorMessage}`);
    assert.ok(duration >= 4500 && duration <= 8000, `Expected wall time around 5000ms, took ${duration}ms`);
    console.log(`  ✔ PASS: Terminated in ${duration}ms with status '${res2.status}'. Server healthy.\n`);

    // 3. Memory Exhaustion Attack (RAM Bomb)
    console.log('Test 3: Memory Exhaustion Attack (`x = "A" * (1024 * 1024 * 500)`)...');
    const res3 = await postCode(`def test_fn():\n    x = "A" * (500 * 1024 * 1024)\n    return True`, 'test_fn');
    assert.equal(res3.status, 'runtime_error');
    assert.match(res3.errorMessage || '', /memory/i, 'Expected memory error message');
    console.log('  ✔ PASS: Memory bomb stopped by 128 MB RAM container ceiling.\n');

    // 4. Filesystem Breakout & Write Attempt
    console.log('Test 4: Filesystem Read-Only Protection (`open("/root/hack.txt", "w")`)...');
    const res4 = await postCode(`def test_fn():\n    with open('/root/hack.txt', 'w') as f:\n        f.write('hacked')\n    return True`, 'test_fn');
    assert.equal(res4.status, 'runtime_error');
    assert.match(res4.errorMessage || res4.caseResults[0]?.error || '', /Read-only file system|PermissionError/i);
    console.log('  ✔ PASS: Filesystem write blocked by read-only container rootfs.\n');

    // 5. Network Access Attempt
    console.log('Test 5: Network Access Block (`urllib.request.urlopen("https://1.1.1.1")`)...');
    const res5 = await postCode(`def test_fn():\n    import urllib.request\n    urllib.request.urlopen("http://1.1.1.1", timeout=2)\n    return True`, 'test_fn');
    assert.equal(res5.status, 'runtime_error');
    assert.match(res5.errorMessage || res5.caseResults[0]?.error || '', /URLError|Network is unreachable|Temporary failure in name resolution/i);
    console.log('  ✔ PASS: Network access blocked by `--network none` flag.\n');

    // 6. Stdout Flooding Bomb Attack
    console.log('Test 6: Stdout Flooding Attack (`while True: print("X"*1000)`)...');
    const res6 = await postCode(`def test_fn():\n    for _ in range(100000):\n        print("X" * 1000)\n    return True`, 'test_fn');
    assert.equal(res6.status, 'runtime_error');
    assert.ok(res6.stdout.includes('[Output truncated: exceeded 64 KB limit]'), 'Expected stdout truncation warning');
    assert.ok(Buffer.byteLength(res6.stdout) <= 70000, `Output buffer size ${Buffer.byteLength(res6.stdout)} exceeds 70KB limit`);
    console.log('  ✔ PASS: Stdout flood capped at 64 KB limit.\n');

    console.log('====================================================');
    console.log('  ALL 6 CONTAINER SECURITY ATTACK TESTS PASSED 100%');
    console.log('====================================================');
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGKILL');
    }
  }
}

runSecuritySuite().catch((err) => {
  console.error('\n❌ SECURITY TEST FAILURE:', err);
  process.exit(1);
});
