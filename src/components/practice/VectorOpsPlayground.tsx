import { useState, useMemo, useEffect } from 'react';
import type { PracticeProblem } from '../../lib/practiceProblem';

export type VectorOpType =
  | 'dot_product'
  | 'elementwise'
  | 'matrix_multiply'
  | 'cosine_similarity'
  | 'normalize'
  | 'softmax'
  | 'magnitude';

export interface VectorOpSpec {
  type: VectorOpType;
  title: string;
  subtitle: string;
  defaultA: number[] | number[][];
  defaultB?: number[] | number[][];
  labelA?: string;
  labelB?: string;
}

interface VectorOpsPlaygroundProps {
  spec: VectorOpSpec;
}

type DotProductComp = {
  type: 'dot_product';
  steps: Array<{ index: number; a: number; b: number; prod: number; runningSum: number }>;
  final: number;
  totalSteps: number;
};

type CosineSimComp = {
  type: 'cosine_similarity';
  steps: Array<{ desc: string; value: number; formula: string }>;
  final: number;
  totalSteps: number;
};

type MagnitudeComp = {
  type: 'magnitude';
  steps: Array<{ index: number; val: number; sq: number; runningSum: number }>;
  sumSq: number;
  final: number;
  totalSteps: number;
};

type NormalizeComp = {
  type: 'normalize';
  steps: Array<{ desc: string; formula: string }>;
  mag: number;
  final: number[];
  totalSteps: number;
};

type SoftmaxComp = {
  type: 'softmax';
  steps: Array<{ desc: string; formula: string }>;
  final: number[];
  totalSteps: number;
};

type MatrixMultiplyComp = {
  type: 'matrix_multiply';
  valid: boolean;
  steps: Array<{ r: number; c: number; terms: Array<{ a: number; b: number; prod: number }>; sum: number }>;
  final: number[][];
  totalSteps: number;
};

type ElementwiseComp = {
  type: 'elementwise';
  steps: Array<{ index: number; a: number; b: number; res: number }>;
  final: number[];
  totalSteps: number;
};

type AnyComputation =
  | DotProductComp
  | CosineSimComp
  | MagnitudeComp
  | NormalizeComp
  | SoftmaxComp
  | MatrixMultiplyComp
  | ElementwiseComp;

export default function VectorOpsPlayground({ spec }: VectorOpsPlaygroundProps) {
  // Check if inputs are 1D vectors or 2D matrices
  const isMatrixA = Array.isArray(spec.defaultA[0]);
  const isMatrixB = spec.defaultB && Array.isArray(spec.defaultB[0]);

  const [vectorA, setVectorA] = useState<number[]>(() =>
    isMatrixA ? [] : (spec.defaultA as number[]).slice(),
  );
  const [vectorB, setVectorB] = useState<number[]>(() =>
    spec.defaultB && !isMatrixB ? (spec.defaultB as number[]).slice() : [],
  );

  const [matrixA, setMatrixA] = useState<number[][]>(() =>
    isMatrixA ? (spec.defaultA as number[][]).map((r) => [...r]) : [],
  );
  const [matrixB, setMatrixB] = useState<number[][]>(() =>
    isMatrixB ? (spec.defaultB as number[][]).map((r) => [...r]) : [],
  );

  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Sync state if spec changes
  useEffect(() => {
    if (isMatrixA) {
      setMatrixA((spec.defaultA as number[][]).map((r) => [...r]));
    } else {
      setVectorA((spec.defaultA as number[]).slice());
    }
    if (spec.defaultB) {
      if (isMatrixB) {
        setMatrixB((spec.defaultB as number[][]).map((r) => [...r]));
      } else {
        setVectorB((spec.defaultB as number[]).slice());
      }
    }
    setStep(0);
    setIsPlaying(false);
  }, [spec.type, spec.title]);

  // Handle vector value changes
  const handleVecAChange = (index: number, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setVectorA((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleVecBChange = (index: number, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setVectorB((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  // Handle matrix value changes
  const handleMatAChange = (r: number, c: number, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setMatrixA((prev) => {
      const next = prev.map((row, ri) => (ri === r ? [...row] : row));
      next[r][c] = val;
      return next;
    });
  };

  const handleMatBChange = (r: number, c: number, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setMatrixB((prev) => {
      const next = prev.map((row, ri) => (ri === r ? [...row] : row));
      next[r][c] = val;
      return next;
    });
  };

  // Compute step-by-step breakdown based on operation type
  const computation: AnyComputation = useMemo(() => {
    if (spec.type === 'dot_product') {
      const len = Math.min(vectorA.length, vectorB.length);
      const steps: Array<{ index: number; a: number; b: number; prod: number; runningSum: number }> = [];
      let sum = 0;
      for (let i = 0; i < len; i++) {
        const prod = (vectorA[i] ?? 0) * (vectorB[i] ?? 0);
        sum += prod;
        steps.push({ index: i, a: vectorA[i] ?? 0, b: vectorB[i] ?? 0, prod, runningSum: sum });
      }
      return { type: 'dot_product', steps, final: sum, totalSteps: steps.length };
    }

    if (spec.type === 'cosine_similarity') {
      const len = Math.min(vectorA.length, vectorB.length);
      let dot = 0;
      let sumSqA = 0;
      let sumSqB = 0;
      for (let i = 0; i < len; i++) {
        const a = vectorA[i] ?? 0;
        const b = vectorB[i] ?? 0;
        dot += a * b;
        sumSqA += a * a;
        sumSqB += b * b;
      }
      const magA = Math.sqrt(sumSqA);
      const magB = Math.sqrt(sumSqB);
      const sim = magA > 0 && magB > 0 ? dot / (magA * magB) : 0;
      const steps = [
        { desc: 'Compute Dot Product: a · b', value: dot, formula: `Σ(a_i × b_i) = ${dot.toFixed(2)}` },
        { desc: 'Compute L2 Norm: ||a||', value: magA, formula: `√(Σ a_i²) = √${sumSqA.toFixed(2)} = ${magA.toFixed(2)}` },
        { desc: 'Compute L2 Norm: ||b||', value: magB, formula: `√(Σ b_i²) = √${sumSqB.toFixed(2)} = ${magB.toFixed(2)}` },
        { desc: 'Cosine Similarity: (a · b) / (||a|| × ||b||)', value: sim, formula: `${dot.toFixed(2)} / (${magA.toFixed(2)} × ${magB.toFixed(2)}) = ${sim.toFixed(4)}` },
      ];
      return { type: 'cosine_similarity', steps, final: sim, totalSteps: steps.length };
    }

    if (spec.type === 'magnitude') {
      let sumSq = 0;
      const steps: Array<{ index: number; val: number; sq: number; runningSum: number }> = [];
      for (let i = 0; i < vectorA.length; i++) {
        const val = vectorA[i] ?? 0;
        const sq = val * val;
        sumSq += sq;
        steps.push({ index: i, val, sq, runningSum: sumSq });
      }
      const mag = Math.sqrt(sumSq);
      return { type: 'magnitude', steps, sumSq, final: mag, totalSteps: steps.length + 1 };
    }

    if (spec.type === 'normalize') {
      let sumSq = 0;
      for (let i = 0; i < vectorA.length; i++) {
        const val = vectorA[i] ?? 0;
        sumSq += val * val;
      }
      const mag = Math.sqrt(sumSq) || 1;
      const normalized = vectorA.map((v) => v / mag);
      const steps = [
        { desc: 'Compute Magnitude ||v||', formula: `√(Σ v_i²) = ${mag.toFixed(3)}` },
        ...vectorA.map((v, i) => ({
          desc: `Normalize element v[${i}]`,
          formula: `${v} / ${mag.toFixed(3)} = ${(v / mag).toFixed(3)}`,
        })),
      ];
      return { type: 'normalize', steps, mag, final: normalized, totalSteps: steps.length };
    }

    if (spec.type === 'softmax') {
      const maxVal = Math.max(...vectorA);
      const exps = vectorA.map((v) => Math.exp(v - maxVal));
      const sumExp = exps.reduce((acc, v) => acc + v, 0) || 1;
      const probs = exps.map((e) => e / sumExp);
      const steps = [
        { desc: `Subtract max(${maxVal.toFixed(1)}) for numerical stability`, formula: `z - max = [${vectorA.map((v) => (v - maxVal).toFixed(2)).join(', ')}]` },
        { desc: 'Exponentiate each element: exp(z_i)', formula: `exp = [${exps.map((e) => e.toFixed(3)).join(', ')}]` },
        { desc: `Sum exponentials: Σ exp(z_j) = ${sumExp.toFixed(3)}`, formula: `Denominator = ${sumExp.toFixed(3)}` },
        ...probs.map((p, i) => ({
          desc: `Probability p[${i}]`,
          formula: `${exps[i]?.toFixed(3)} / ${sumExp.toFixed(3)} = ${(p * 100).toFixed(1)}%`,
        })),
      ];
      return { type: 'softmax', steps, final: probs, totalSteps: steps.length };
    }

    if (spec.type === 'matrix_multiply') {
      const rowsA = matrixA.length;
      const colsA = matrixA[0]?.length ?? 0;
      const rowsB = matrixB.length;
      const colsB = matrixB[0]?.length ?? 0;

      const valid = colsA === rowsB && rowsA > 0 && colsB > 0;
      const result: number[][] = [];
      const steps: Array<{ r: number; c: number; terms: Array<{ a: number; b: number; prod: number }>; sum: number }> = [];

      if (valid) {
        for (let r = 0; r < rowsA; r++) {
          result[r] = [];
          for (let c = 0; c < colsB; c++) {
            let sum = 0;
            const terms: Array<{ a: number; b: number; prod: number }> = [];
            for (let k = 0; k < colsA; k++) {
              const a = matrixA[r]?.[k] ?? 0;
              const b = matrixB[k]?.[c] ?? 0;
              const prod = a * b;
              sum += prod;
              terms.push({ a, b, prod });
            }
            result[r][c] = sum;
            steps.push({ r, c, terms, sum });
          }
        }
      }
      return { type: 'matrix_multiply', valid, steps, final: result, totalSteps: steps.length };
    }

    // Default elementwise addition
    const len = Math.min(vectorA.length, vectorB.length);
    const steps: Array<{ index: number; a: number; b: number; res: number }> = [];
    const res: number[] = [];
    for (let i = 0; i < len; i++) {
      const a = vectorA[i] ?? 0;
      const b = vectorB[i] ?? 0;
      const sum = a + b;
      res.push(sum);
      steps.push({ index: i, a, b, res: sum });
    }
    return { type: 'elementwise', steps, final: res, totalSteps: steps.length };
  }, [spec.type, vectorA, vectorB, matrixA, matrixB]);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= computation.totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(timer);
  }, [isPlaying, computation.totalSteps]);

  const maxSteps = computation.totalSteps;

  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid var(--nm-border)',
        background: 'var(--nm-surface)',
        padding: '16px',
        color: 'var(--nm-text-primary)',
        margin: '12px 0 20px',
        fontSize: 13,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--nm-accent-secondary)', marginBottom: 2 }}>
            Interactive Vector Lab
          </div>
          <h4 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 700, color: 'var(--nm-text-primary)' }}>
            {spec.title}
          </h4>
          <div style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>
            {spec.subtitle}
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step <= 0}
            style={btnStyle}
            title="Previous Step"
          >
            ← Step
          </button>
          <button
            type="button"
            onClick={() => {
              if (step >= maxSteps) setStep(0);
              setIsPlaying(!isPlaying);
            }}
            style={{
              ...btnStyle,
              background: isPlaying ? 'var(--nm-accent-warn)' : 'var(--nm-accent-primary)',
              color: 'var(--nm-bg, #fff)',
              borderColor: 'transparent',
              fontWeight: 700,
            }}
          >
            {isPlaying ? 'Pause' : step >= maxSteps ? 'Replay' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(maxSteps, s + 1))}
            disabled={step >= maxSteps}
            style={btnStyle}
            title="Next Step"
          >
            Step →
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setIsPlaying(false);
            }}
            style={btnStyle}
            title="Reset steps"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Editable Inputs Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 12,
          borderRadius: 8,
          background: 'var(--nm-surface-alt)',
          border: '1px solid var(--nm-border)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--nm-text-secondary)', letterSpacing: '0.04em' }}>
            Editable Inputs (change values live)
          </span>
          <span style={{ fontSize: 11, color: 'var(--nm-text-muted)' }}>
            Step {step} of {maxSteps}
          </span>
        </div>

        {/* Vector 1D Inputs */}
        {!isMatrixA && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--nm-accent-secondary)', minWidth: 20 }}>
                {spec.labelA ?? 'a'} =
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {vectorA.map((val, i) => {
                  const isHighlighted =
                    step > 0 &&
                    ((computation.type === 'dot_product' && computation.steps[step - 1]?.index === i) ||
                      (computation.type === 'elementwise' && computation.steps[step - 1]?.index === i) ||
                      (computation.type === 'magnitude' && step - 1 === i) ||
                      (computation.type === 'normalize' && step > 1 && step - 2 === i));

                  return (
                    <input
                      key={i}
                      type="number"
                      value={val}
                      onChange={(e) => handleVecAChange(i, e.target.value)}
                      style={{
                        width: 56,
                        padding: '4px 6px',
                        borderRadius: 4,
                        border: `1.5px solid ${isHighlighted ? 'var(--nm-accent-primary)' : 'var(--nm-border)'}`,
                        background: isHighlighted
                          ? 'color-mix(in srgb, var(--nm-accent-primary) 15%, var(--nm-surface))'
                          : 'var(--nm-surface)',
                        color: 'var(--nm-text-primary)',
                        textAlign: 'center',
                        fontSize: 12,
                        fontFamily: 'ui-monospace, monospace',
                        fontWeight: isHighlighted ? 700 : 500,
                      }}
                      aria-label={`Vector A element ${i}`}
                    />
                  );
                })}
              </div>
            </div>

            {spec.defaultB && !isMatrixB && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--nm-accent-teal)', minWidth: 20 }}>
                  {spec.labelB ?? 'b'} =
                </span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {vectorB.map((val, i) => {
                    const isHighlighted =
                      step > 0 &&
                      ((computation.type === 'dot_product' && computation.steps[step - 1]?.index === i) ||
                        (computation.type === 'elementwise' && computation.steps[step - 1]?.index === i));

                    return (
                      <input
                        key={i}
                        type="number"
                        value={val}
                        onChange={(e) => handleVecBChange(i, e.target.value)}
                        style={{
                          width: 56,
                          padding: '4px 6px',
                          borderRadius: 4,
                          border: `1.5px solid ${isHighlighted ? 'var(--nm-accent-teal)' : 'var(--nm-border)'}`,
                          background: isHighlighted
                            ? 'color-mix(in srgb, var(--nm-accent-teal) 15%, var(--nm-surface))'
                            : 'var(--nm-surface)',
                          color: 'var(--nm-text-primary)',
                          textAlign: 'center',
                          fontSize: 12,
                          fontFamily: 'ui-monospace, monospace',
                          fontWeight: isHighlighted ? 700 : 500,
                        }}
                        aria-label={`Vector B element ${i}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Matrix 2D Inputs */}
        {isMatrixA && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--nm-accent-secondary)', marginBottom: 4 }}>
                {spec.labelA ?? 'Matrix A'} ({matrixA.length}×{matrixA[0]?.length ?? 0}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matrixA.map((row, r) => (
                  <div key={r} style={{ display: 'flex', gap: 4 }}>
                    {row.map((val, c) => (
                      <input
                        key={c}
                        type="number"
                        value={val}
                        onChange={(e) => handleMatAChange(r, c, e.target.value)}
                        style={{
                          width: 50,
                          padding: '3px 4px',
                          borderRadius: 4,
                          border: '1px solid var(--nm-border)',
                          background: 'var(--nm-surface)',
                          color: 'var(--nm-text-primary)',
                          textAlign: 'center',
                          fontSize: 12,
                          fontFamily: 'ui-monospace, monospace',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {isMatrixB && (
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--nm-accent-teal)', marginBottom: 4 }}>
                  {spec.labelB ?? 'Matrix B'} ({matrixB.length}×{matrixB[0]?.length ?? 0}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {matrixB.map((row, r) => (
                    <div key={r} style={{ display: 'flex', gap: 4 }}>
                      {row.map((val, c) => (
                        <input
                          key={c}
                          type="number"
                          value={val}
                          onChange={(e) => handleMatBChange(r, c, e.target.value)}
                          style={{
                            width: 50,
                            padding: '3px 4px',
                            borderRadius: 4,
                            border: '1px solid var(--nm-border)',
                            background: 'var(--nm-surface)',
                            color: 'var(--nm-text-primary)',
                            textAlign: 'center',
                            fontSize: 12,
                            fontFamily: 'ui-monospace, monospace',
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stepped Visualization Display */}
      <div
        style={{
          borderRadius: 8,
          border: '1px solid var(--nm-border)',
          background: 'var(--nm-surface-alt)',
          padding: '14px',
          minHeight: 110,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Dot Product Step View */}
        {computation.type === 'dot_product' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {step === 0 ? (
                <span style={{ color: 'var(--nm-text-muted)' }}>
                  Click <strong>Step →</strong> or <strong>Play</strong> to walk through pairwise multiplication and accumulation.
                </span>
              ) : (
                <>
                  <span style={{ fontWeight: 700, color: 'var(--nm-text-secondary)', fontSize: 12 }}>
                    Step {step}:
                  </span>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13.5 }}>
                    a[{computation.steps[step - 1]?.index}] × b[{computation.steps[step - 1]?.index}] ={' '}
                    <strong style={{ color: 'var(--nm-accent-primary)' }}>
                      {computation.steps[step - 1]?.a} × {computation.steps[step - 1]?.b} = {computation.steps[step - 1]?.prod}
                    </strong>
                  </span>
                  <span style={{ color: 'var(--nm-text-muted)', fontSize: 12 }}>
                    (Running sum: {computation.steps[step - 1]?.runningSum})
                  </span>
                </>
              )}
            </div>

            {/* Visual Formula Chain */}
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12.5,
                lineHeight: 1.6,
                padding: '8px 10px',
                borderRadius: 6,
                background: 'var(--nm-surface)',
                border: '1px solid var(--nm-border)',
                overflowX: 'auto',
              }}
            >
              <span style={{ color: 'var(--nm-text-muted)' }}>dot = </span>
              {computation.steps.map((st, i) => (
                <span
                  key={i}
                  style={{
                    color: i < step ? 'var(--nm-accent-primary)' : 'var(--nm-text-muted)',
                    fontWeight: i === step - 1 ? 700 : 400,
                    textDecoration: i === step - 1 ? 'underline' : 'none',
                  }}
                >
                  ({st.a} × {st.b}){i < computation.steps.length - 1 ? ' + ' : ''}
                </span>
              ))}
              <span style={{ fontWeight: 700, color: 'var(--nm-text-primary)', marginLeft: 8 }}>
                = {step >= maxSteps ? computation.final : (computation.steps[step - 1]?.runningSum ?? '…')}
              </span>
            </div>
          </div>
        )}

        {/* Cosine Similarity Step View */}
        {computation.type === 'cosine_similarity' && (
          <div>
            <div style={{ marginBottom: 8, fontSize: 13 }}>
              {step === 0 ? (
                <span style={{ color: 'var(--nm-text-muted)' }}>
                  Cosine similarity measures angular alignment between two vectors, normalized to [-1, 1].
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontWeight: 700, color: 'var(--nm-accent-secondary)' }}>
                    {computation.steps[step - 1]?.desc}
                  </div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--nm-text-primary)' }}>
                    {computation.steps[step - 1]?.formula}
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginTop: 4 }}>
              Formula: cos(θ) = (a · b) / (||a|| ||b||)
            </div>
          </div>
        )}

        {/* Softmax Step View */}
        {computation.type === 'softmax' && (
          <div>
            <div style={{ marginBottom: 8 }}>
              {step === 0 ? (
                <span style={{ color: 'var(--nm-text-muted)' }}>
                  Softmax turns raw logits into a normalized probability distribution where Σ p_i = 1.
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontWeight: 700, color: 'var(--nm-accent-purple)' }}>
                    {computation.steps[step - 1]?.desc}
                  </div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--nm-text-primary)' }}>
                    {computation.steps[step - 1]?.formula}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {computation.final.map((p, i) => (
                <div
                  key={i}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'var(--nm-surface)',
                    border: '1px solid var(--nm-border)',
                    fontSize: 11.5,
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  p[{i}]: <strong>{(p * 100).toFixed(1)}%</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Magnitude Step View */}
        {computation.type === 'magnitude' && (
          <div>
            {step === 0 ? (
              <span style={{ color: 'var(--nm-text-muted)' }}>
                Vector magnitude (Euclidean L2 norm) computes Euclidean distance from origin: ||v|| = √(Σ v_i²).
              </span>
            ) : step <= computation.steps.length ? (
              <div>
                <span style={{ fontFamily: 'ui-monospace, monospace' }}>
                  Element v[{step - 1}] = {computation.steps[step - 1]?.val} → Squared:{' '}
                  <strong>{computation.steps[step - 1]?.sq}</strong> (Running sum: {computation.steps[step - 1]?.runningSum})
                </span>
              </div>
            ) : (
              <div>
                <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--nm-accent-primary)', fontWeight: 700 }}>
                  Final: √({computation.sumSq}) = {computation.final.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Normalize Step View */}
        {computation.type === 'normalize' && (
          <div>
            {step === 0 ? (
              <span style={{ color: 'var(--nm-text-muted)' }}>
                Normalizing scales a vector to unit length (||v̂|| = 1) while preserving its direction.
              </span>
            ) : (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--nm-accent-secondary)', marginBottom: 2 }}>
                  {computation.steps[step - 1]?.desc}
                </div>
                <div style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {computation.steps[step - 1]?.formula}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Matrix Multiply Step View */}
        {computation.type === 'matrix_multiply' && (
          <div>
            {step === 0 ? (
              <span style={{ color: 'var(--nm-text-muted)' }}>
                Each output cell C[i, j] is computed as the dot product of Row i of A and Column j of B.
              </span>
            ) : (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--nm-text-secondary)', marginBottom: 2 }}>
                  Computing Output Cell C[{computation.steps[step - 1]?.r}, {computation.steps[step - 1]?.c}]:
                </div>
                <div style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {computation.steps[step - 1]?.terms.map((t, idx) => (
                    <span key={idx}>
                      ({t.a} × {t.b}){idx < (computation.steps[step - 1]?.terms.length ?? 0) - 1 ? ' + ' : ''}
                    </span>
                  ))}
                  {' = '}
                  <strong style={{ color: 'var(--nm-accent-primary)' }}>
                    {computation.steps[step - 1]?.sum}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elementwise Step View */}
        {computation.type === 'elementwise' && (
          <div>
            {step === 0 ? (
              <span style={{ color: 'var(--nm-text-muted)' }}>
                Elementwise operations apply a binary operator to corresponding coordinates independently.
              </span>
            ) : (
              <div style={{ fontFamily: 'ui-monospace, monospace' }}>
                a[{computation.steps[step - 1]?.index}] + b[{computation.steps[step - 1]?.index}] ={' '}
                {computation.steps[step - 1]?.a} + {computation.steps[step - 1]?.b} ={' '}
                <strong style={{ color: 'var(--nm-accent-primary)' }}>
                  {computation.steps[step - 1]?.res}
                </strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Display Banner */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 6,
          background: 'var(--nm-surface)',
          border: '1px solid var(--nm-border)',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--nm-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Live Result
        </span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 700, color: 'var(--nm-accent-primary)' }}>
          {Array.isArray(computation.final)
            ? Array.isArray(computation.final[0])
              ? `[${(computation.final as number[][]).map((row) => `[${row.join(', ')}]`).join(', ')}]`
              : `[${(computation.final as number[]).map((n) => (typeof n === 'number' ? n.toFixed(3).replace(/\.?0+$/, '') : n)).join(', ')}]`
            : typeof computation.final === 'number'
              ? computation.final.toFixed(4).replace(/\.?0+$/, '')
              : String(computation.final)}
        </span>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid var(--nm-border)',
  background: 'var(--nm-surface)',
  color: 'var(--nm-text-primary)',
  fontSize: 11.5,
  fontWeight: 600,
  cursor: 'pointer',
} as const;

/**
 * Conservative classifier: detects if a practice problem qualifies for
 * the VectorOpsPlayground and returns the appropriate VectorOpSpec.
 */
export function getVectorOpSpec(problem: PracticeProblem): VectorOpSpec | null {
  const fn = (problem.functionName || '').toLowerCase();
  const id = (problem.id || '').toLowerCase();

  // 1. Batch Dot Product or Dot Product
  if (
    fn === 'batch_dot_product' ||
    fn === 'dot_product' ||
    id.includes('batch-dot-product') ||
    id.includes('dot-product') ||
    /\bdot_product\b/.test(fn)
  ) {
    return {
      type: 'dot_product',
      title: 'Vector Dot Product',
      subtitle: 'Pairwise coordinate multiplication and accumulation: a · b = Σ (a_i × b_i)',
      defaultA: [1, 2, 3],
      defaultB: [4, 5, 6],
      labelA: 'a',
      labelB: 'b',
    };
  }

  // 2. Cosine Similarity
  if (
    fn === 'cosine_similarity' ||
    fn === 'cosine_sim' ||
    id.includes('cosine-similarity') ||
    /\bcosine_sim(ilarity)?\b/.test(fn)
  ) {
    return {
      type: 'cosine_similarity',
      title: 'Cosine Similarity',
      subtitle: 'Angular alignment in vector space: cos(θ) = (a · b) / (||a|| ||b||)',
      defaultA: [1, 2, 3],
      defaultB: [2, 4, 5],
      labelA: 'u',
      labelB: 'v',
    };
  }

  // 3. Matrix Multiplication
  if (
    fn === 'matmul' ||
    fn === 'matrix_multiply' ||
    fn === 'matrix_multiplication' ||
    id.includes('matrix-multiplication') ||
    id.includes('matmul')
  ) {
    return {
      type: 'matrix_multiply',
      title: 'Matrix Multiplication (A @ B)',
      subtitle: 'Row-by-column dot products forming the product matrix C',
      defaultA: [
        [1, 2],
        [3, 4],
      ],
      defaultB: [
        [5, 6],
        [7, 8],
      ],
      labelA: 'A',
      labelB: 'B',
    };
  }

  // 4. Softmax
  if (
    fn === 'softmax' ||
    fn === 'temperature_softmax' ||
    id.includes('softmax') ||
    /\bsoftmax\b/.test(fn)
  ) {
    return {
      type: 'softmax',
      title: 'Softmax Activation',
      subtitle: 'Exponentiation and normalisation mapping logits to probabilities: p_i = exp(z_i) / Σ exp(z_j)',
      defaultA: [2.0, 1.0, 0.1],
      labelA: 'z',
    };
  }

  // 5. Vector Magnitude / L2 Norm
  if (
    fn === 'vector_magnitude' ||
    fn === 'l2_norm' ||
    fn === 'vector_norm' ||
    id.includes('vector-magnitude') ||
    id.includes('l2-norm')
  ) {
    return {
      type: 'magnitude',
      title: 'Vector Magnitude (L2 Norm)',
      subtitle: 'Euclidean length from coordinate origins: ||v|| = √(Σ v_i²)',
      defaultA: [3, 4],
      labelA: 'v',
    };
  }

  // 6. Vector Normalization
  if (
    fn === 'normalize_vector' ||
    fn === 'normalize' ||
    fn === 'l2_normalize' ||
    id.includes('vector-normalize') ||
    id.includes('normalize-vector')
  ) {
    return {
      type: 'normalize',
      title: 'Vector Normalization',
      subtitle: 'Scaling vector to unit length (magnitude = 1.0) preserving direction',
      defaultA: [3, 4],
      labelA: 'v',
    };
  }

  // 7. Elementwise operations
  if (
    fn.startsWith('elementwise_') ||
    fn === 'vector_add' ||
    id.includes('elementwise-add')
  ) {
    return {
      type: 'elementwise',
      title: 'Elementwise Operation',
      subtitle: 'Applying component-wise arithmetic across matching indices',
      defaultA: [1, 5, 10],
      defaultB: [2, 3, 4],
      labelA: 'a',
      labelB: 'b',
    };
  }

  return null;
}
