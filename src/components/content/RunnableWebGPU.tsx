import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useVizTokens, RADIUS, SPACING, FONT_FAMILY } from '../../theme/vizTokens';
import { useGamification } from '../../contexts/GamificationContext';
import { normalizeRoute } from '../../lib/contentTree';

interface WebGPUTestCase {
  name: string;
  input: number[];
  expected: number;
  tolerance?: number;
}

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

type Status = 'idle' | 'running' | 'done';

/**
 * Real, in-browser WebGPU compute-shader execution -- no CDN download (WGSL
 * compiles via the browser's own built-in WebGPU implementation, unlike
 * Pyodide, which has to fetch a WASM runtime), but a genuinely different
 * execution shape from RunnableCode: the learner edits a full WGSL compute
 * shader, which this component compiles and dispatches against real input
 * data on a real (or software-fallback) GPU, then reads the result back and
 * compares it -- real pass/fail per test case, never a heuristic/simulated
 * "looks about right" grade.
 *
 * Fixed harness contract this component assumes (documented here since,
 * unlike RunnableCode's tests= which are free-form Python assertions, WGSL
 * needs real GPU buffers wired up by *something* -- the learner writes the
 * shader body, not the buffer/dispatch setup):
 *   - binding(0): `var<storage, read> input: array<f32>` -- the test case's
 *     input array, one element per invocation's natural index.
 *   - binding(1): `var<storage, read_write> output: array<f32>` -- a single
 *     f32 slot (index 0) the shader must write its one scalar result to.
 *   - Dispatched as exactly ONE workgroup (dispatchWorkgroups(1)) -- this
 *     harness is for single-workgroup problems (a real, common constraint:
 *     a shader that reduces within one workgroup's shared memory, e.g. a
 *     parallel sum via tree reduction). A true multi-workgroup reduction
 *     needs either multiple dispatch passes or atomics across workgroups --
 *     a real, harder follow-up problem, not what this harness supports.
 *
 * WebGPU requires a secure context (this app's own real https/localhost
 * origin qualifies; a sandboxed iframe/blob URL would not) -- confirmed via
 * direct testing, not assumed from spec text alone.
 */
export default function RunnableWebGPU({ code: initialCode, tests }: { code: string; tests: WebGPUTestCase[] }) {
  const t = useVizTokens();
  const { awardProblemCompleted } = useGamification();
  const permalink = normalizeRoute(useLocation().pathname);
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [unsupported, setUnsupported] = useState<string | null>(null);

  const deviceRef = useRef<GPUDevice | null>(null);

  async function ensureDevice(): Promise<GPUDevice> {
    if (deviceRef.current) return deviceRef.current;
    if (!('gpu' in navigator)) {
      throw new Error(
        'UNSUPPORTED: WebGPU is not available in this browser. It ships by default in recent Chrome, Edge, and Safari, and Firefox on Windows -- try one of those, or a more recent version.',
      );
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('UNSUPPORTED: navigator.gpu.requestAdapter() returned no adapter -- WebGPU is present but no GPU (or software fallback) is available here.');
    }
    const device = await adapter.requestDevice();
    deviceRef.current = device;
    return device;
  }

  async function runOneCase(device: GPUDevice, shaderModule: GPUShaderModule, testCase: WebGPUTestCase): Promise<TestResult> {
    const inputData = new Float32Array(testCase.input);
    const inputBuffer = device.createBuffer({
      size: Math.max(inputData.byteLength, 4),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(inputBuffer, 0, inputData);

    const outputBuffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const readBuffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module: shaderModule, entryPoint: 'main' } });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: outputBuffer } },
      ],
    });

    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(1);
    pass.end();
    commandEncoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, 4);
    device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const actual = new Float32Array(readBuffer.getMappedRange().slice(0))[0];
    readBuffer.unmap();
    inputBuffer.destroy();
    outputBuffer.destroy();
    readBuffer.destroy();

    const tolerance = testCase.tolerance ?? 1e-3;
    const passed = Math.abs(actual - testCase.expected) < tolerance;
    return {
      name: testCase.name,
      passed,
      detail: passed ? 'passed' : `expected ${testCase.expected}, got ${Number.isFinite(actual) ? actual : 'NaN/undefined (did every thread write to output[0]?)'}`,
    };
  }

  async function run() {
    setStatus('running');
    setError(null);
    setTestResults(null);
    setUnsupported(null);

    try {
      const device = await ensureDevice();

      const shaderModule = device.createShaderModule({ code });
      const info = await shaderModule.getCompilationInfo();
      const compileErrors = info.messages.filter((m) => m.type === 'error');
      if (compileErrors.length > 0) {
        setError(compileErrors.map((m) => `line ${m.lineNum}:${m.linePos} — ${m.message}`).join('\n'));
        setStatus('done');
        return;
      }

      const results: TestResult[] = [];
      for (const testCase of tests) {
        results.push(await runOneCase(device, shaderModule, testCase));
      }
      setTestResults(results);
      if (results.length > 0 && results.every((r) => r.passed)) {
        awardProblemCompleted(permalink); // no-op if this page already earned it once
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.startsWith('UNSUPPORTED:')) {
        setUnsupported(message.replace('UNSUPPORTED: ', ''));
      } else {
        setError(message);
      }
    } finally {
      setStatus('done');
    }
  }

  const isBusy = status === 'running';

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RADIUS.md, margin: `${SPACING.sm}px 0`, background: t.surfaceAlt, fontFamily: FONT_FAMILY, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${SPACING.xs}px ${SPACING.sm}px`, borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.accentTeal }}>Implement it yourself (WGSL)</span>
        <button type="button" onClick={run} disabled={isBusy} style={btnStyle(t, isBusy)}>
          {status === 'running' ? 'Running…' : 'Run'}
        </button>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={Math.min(Math.max(code.split('\n').length, 4), 26)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: SPACING.sm,
          background: t.surface,
          color: t.textPrimary,
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      />

      {unsupported && (
        <div style={{ padding: SPACING.sm, fontSize: 13, color: t.textSecondary, borderTop: `1px solid ${t.border}` }}>
          <strong style={{ color: t.accentWarn }}>Can't run here: </strong>
          {unsupported}
        </div>
      )}

      {status === 'done' && !unsupported && (
        <div style={{ padding: SPACING.sm, borderTop: `1px solid ${t.border}` }}>
          {error && (
            <pre style={{ margin: 0, fontSize: 12.5, color: t.accentDanger, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace' }}>{error}</pre>
          )}
          {testResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {testResults.map((r, i) => (
                <div key={i} style={{ fontSize: 12.5, color: r.passed ? t.accentPrimary : t.accentDanger, fontFamily: 'ui-monospace, monospace' }}>
                  {r.passed ? '✓' : '✗'} {r.name}
                  {!r.passed && <div style={{ paddingLeft: 16, color: t.textSecondary, whiteSpace: 'pre-wrap' }}>{r.detail}</div>}
                </div>
              ))}
              <div style={{ marginTop: 4, fontSize: 12, color: t.textSecondary }}>
                {testResults.filter((r) => r.passed).length} / {testResults.length} passed
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function btnStyle(t: ReturnType<typeof useVizTokens>, disabled: boolean) {
  return {
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '5px 12px',
    borderRadius: RADIUS.sm,
    fontSize: 12.5,
    fontFamily: FONT_FAMILY,
    fontWeight: 600,
    border: `1px solid ${t.accentPrimary}`,
    background: t.accentPrimary,
    color: t.background,
    opacity: disabled ? 0.6 : 1,
  } as const;
}
