import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PracticeProblem } from '../../lib/practiceProblem';
import { useVizTokens } from '../../theme/vizTokens';

interface ProblemPanelProps {
  problem: PracticeProblem;
  mdxContent?: React.ReactNode;
  solved?: boolean;
  onExpandFocus?: () => void;
  isFocused?: boolean;
}

// Real difficulty accent tokens -- same easy/medium/hard mapping
// PracticeListPage.tsx's DIFFICULTY_COLOR already uses (accent-primary /
// accent-warn / accent-danger), so this panel stays consistent with the
// rest of the app instead of a separate hardcoded hex-per-difficulty scale
// that only ever looked right in dark mode.
const DIFFICULTY_ACCENT: Record<string, string> = {
  easy: 'var(--nm-accent-primary)',
  medium: 'var(--nm-accent-warn)',
  hard: 'var(--nm-accent-danger)',
};

export default function ProblemPanel({ problem, mdxContent, solved, onExpandFocus, isFocused }: ProblemPanelProps) {
  const t = useVizTokens();
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'intuition'>('problem');

  const difficultyColor = DIFFICULTY_ACCENT[problem.difficulty] ?? 'var(--nm-accent-danger)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--nm-surface)',
        color: 'var(--nm-text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',

          padding: '10px 16px',
          borderBottom: '1px solid var(--nm-border)',
          background: 'color-mix(in srgb, var(--nm-surface-alt) 60%, transparent)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setActiveTab('problem')}
            style={{
              background: activeTab === 'problem' ? 'color-mix(in srgb, var(--nm-accent-secondary) 20%, transparent)' : 'transparent',
              border: `1px solid ${activeTab === 'problem' ? 'color-mix(in srgb, var(--nm-accent-secondary) 40%, transparent)' : 'transparent'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === 'problem' ? 'var(--nm-accent-secondary)' : 'var(--nm-text-muted)',
              cursor: 'pointer',
            }}
          >
            📋 Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intuition')}
            style={{
              background: activeTab === 'intuition' ? 'color-mix(in srgb, var(--nm-accent-secondary) 20%, transparent)' : 'transparent',
              border: `1px solid ${activeTab === 'intuition' ? 'color-mix(in srgb, var(--nm-accent-secondary) 40%, transparent)' : 'transparent'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === 'intuition' ? 'var(--nm-accent-secondary)' : 'var(--nm-text-muted)',
              cursor: 'pointer',
            }}
          >
            💡 Worked Intuition
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            style={{
              background: 'color-mix(in srgb, var(--nm-accent-purple) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--nm-accent-purple) 30%, transparent)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--nm-accent-purple)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>✨</span> Need Help?
          </button>

          {onExpandFocus && (
            <button
              type="button"
              onClick={onExpandFocus}
              title={isFocused ? 'Restore Workspace Layout' : 'Focus Reading Mode'}
              style={{
                background: 'transparent',
                border: '1px solid var(--nm-border)',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                color: 'var(--nm-text-muted)',
                cursor: 'pointer',
              }}
            >
              {isFocused ? '↙ Exit Focus' : '⤢ Focus'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {activeTab === 'problem' ? (
          <div>
            {/* Title & Metadata Badges */}
            <div style={{ marginBottom: 16 }}>
              {/* Real bug this fixes: --nm-text-heading was never a real
                 defined CSS variable anywhere in theme.css -- it always
                 fell through to the hardcoded #f8fafc fallback, a
                 near-white color that's correct only in dark mode. */}
              <h1 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)' }}>
                {problem.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: `color-mix(in srgb, ${difficultyColor} 20%, transparent)`,
                    color: difficultyColor,
                    border: `1px solid color-mix(in srgb, ${difficultyColor} 40%, transparent)`,
                  }}
                >
                  {problem.difficulty}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'color-mix(in srgb, var(--nm-accent-secondary) 15%, transparent)',
                    color: 'var(--nm-accent-secondary)',
                    border: '1px solid color-mix(in srgb, var(--nm-accent-secondary) 30%, transparent)',
                  }}
                >
                  {problem.topic}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'color-mix(in srgb, var(--nm-text-muted) 10%, transparent)',
                    color: 'var(--nm-text-muted)',
                    border: '1px solid var(--nm-border)',
                  }}
                >
                  ⏱ {problem.estimatedTime}
                </span>

                {solved && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'color-mix(in srgb, var(--nm-accent-primary) 20%, transparent)',
                      color: 'var(--nm-accent-primary)',
                      border: '1px solid color-mix(in srgb, var(--nm-accent-primary) 40%, transparent)',
                    }}
                  >
                    ✓ Solved
                  </span>
                )}
              </div>

              {problem.libraryPolicyText && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background:
                      'linear-gradient(90deg, color-mix(in srgb, var(--nm-accent-primary) 15%, transparent) 0%, color-mix(in srgb, var(--nm-accent-secondary) 15%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--nm-accent-primary) 35%, transparent)',
                    color: 'var(--nm-accent-primary)',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>⚡</span> {problem.libraryPolicyText}
                </div>
              )}
            </div>

            {/* Mission Box */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--nm-accent-secondary) 10%, transparent) 0%, color-mix(in srgb, var(--nm-accent-secondary) 5%, transparent) 100%)',
                borderLeft: '4px solid var(--nm-accent-secondary)',
                borderRadius: '0 8px 8px 0',
                padding: '12px 16px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nm-accent-secondary)', marginBottom: 4 }}>
                🎯 Mission
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--nm-text-primary)' }}>{problem.mission}</div>
            </div>

            {/* Task Description */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Task
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--nm-text-primary)' }}>{problem.taskDescription}</p>
            </div>

            {/* Expected Function Signature */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Function Signature
              </h3>
              <pre
                style={{
                  margin: 0,
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'var(--nm-surface-alt)',
                  border: '1px solid var(--nm-border)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: 13,
                  color: 'var(--nm-accent-secondary)',
                }}
              >
                {problem.functionSignature}
              </pre>
            </div>

            {/* Examples Preview */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text-secondary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {problem.testCases
                  .filter((tc) => !tc.hidden)
                  .map((tc, idx) => (
                    <div
                      key={tc.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: 'var(--nm-surface-alt)',
                        border: '1px solid var(--nm-border)',
                        fontSize: 13,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--nm-text-secondary)', marginBottom: 6, fontFamily: 'inherit' }}>
                        Example {idx + 1}: {tc.label}
                      </div>
                      <div style={{ color: 'var(--nm-text-primary)' }}>
                        <span style={{ color: 'var(--nm-text-muted)' }}>Input: </span>
                        {JSON.stringify(tc.input)}
                      </div>
                      <div style={{ color: 'var(--nm-accent-primary)', marginTop: 4 }}>
                        <span style={{ color: 'var(--nm-text-muted)' }}>Output: </span>
                        {tc.expectError ? `Raises ${tc.expectError}` : JSON.stringify(tc.expectedOutput)}
                      </div>
                      {tc.description && (
                        <div style={{ color: 'var(--nm-text-secondary)', fontSize: 12, marginTop: 4, fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                          Explanation: {tc.description}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--nm-text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Constraints
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 1.6, color: 'var(--nm-text-primary)' }}>
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Related Concept Links */}
            {problem.conceptConnections && problem.conceptConnections.length > 0 && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'color-mix(in srgb, var(--nm-surface-alt) 50%, transparent)',
                  border: '1px solid var(--nm-border)',
                  marginTop: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.accentTeal, marginBottom: 8 }}>
                  🔗 Related AI/ML Concepts
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {problem.conceptConnections.map((conn, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-text-primary)' }}>{conn.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--nm-text-secondary)' }}>{conn.description}</div>
                      </div>
                      <Link
                        to={conn.route}
                        style={{
                          fontSize: 12,
                          color: 'var(--nm-accent-secondary)',
                          textDecoration: 'none',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'color-mix(in srgb, var(--nm-accent-secondary) 10%, transparent)',
                        }}
                      >
                        Read →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Intuition Tab / MDX Prose Fallback */
          <div>
            {mdxContent ? (
              mdxContent
            ) : (
              <div style={{ lineHeight: 1.6, color: 'var(--nm-text-primary)', fontSize: 14 }}>
                <h3>Mathematical Intuition</h3>
                <p>
                  For vectors $a$ and $b$, the dot product computes $a \cdot b = \sum_i a_i b_i$. It pairs corresponding coordinates, multiplies them, and sums the total.
                </p>
                <p>
                  In modern Machine Learning, dot products quantify vector alignment, form matrix multiplications (A · B), and drive self-attention mechanisms (Q · K^T / sqrt(d_k)).

                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progressive AI Assistance Drawer */}
      {showAiDrawer && problem.hints && (
        <div
          style={{
            borderTop: '1px solid color-mix(in srgb, var(--nm-accent-purple) 30%, transparent)',
            background: 'color-mix(in srgb, var(--nm-surface) 95%, transparent)',
            padding: 16,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--nm-accent-purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✨</span> AI Progressive Guidance
            </span>
            <button
              type="button"
              onClick={() => setShowAiDrawer(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--nm-text-muted)', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setHintLevel(1)}
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid color-mix(in srgb, var(--nm-accent-purple) 40%, transparent)',
                background: hintLevel >= 1 ? 'color-mix(in srgb, var(--nm-accent-purple) 20%, transparent)' : 'transparent',
                color: 'var(--nm-text-primary)',
                cursor: 'pointer',
              }}
            >
              Small Hint
            </button>
            <button
              type="button"
              onClick={() => setHintLevel(2)}
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid color-mix(in srgb, var(--nm-accent-purple) 40%, transparent)',
                background: hintLevel >= 2 ? 'color-mix(in srgb, var(--nm-accent-purple) 20%, transparent)' : 'transparent',
                color: 'var(--nm-text-primary)',
                cursor: 'pointer',
              }}
            >
              Stronger Hint
            </button>
            <button
              type="button"
              onClick={() => setHintLevel(3)}
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid color-mix(in srgb, var(--nm-accent-purple) 40%, transparent)',
                background: hintLevel >= 3 ? 'color-mix(in srgb, var(--nm-accent-purple) 20%, transparent)' : 'transparent',
                color: 'var(--nm-text-primary)',
                cursor: 'pointer',
              }}
            >
              Concept Explanation
            </button>
          </div>

          {hintLevel === 0 && <div style={{ fontSize: 12.5, color: 'var(--nm-text-secondary)' }}>Select a hint level above to receive progressive guidance without spoiling the answer.</div>}
          {hintLevel >= 1 && <div style={{ fontSize: 13, color: 'var(--nm-text-primary)', marginBottom: 8 }}>💡 <strong>Hint 1:</strong> {problem.hints.small}</div>}
          {hintLevel >= 2 && <div style={{ fontSize: 13, color: 'var(--nm-text-primary)', marginBottom: 8 }}>🚀 <strong>Hint 2:</strong> {problem.hints.strong}</div>}
          {hintLevel >= 3 && <div style={{ fontSize: 13, color: 'var(--nm-text-primary)' }}>🎓 <strong>Concept:</strong> {problem.hints.concept}</div>}
        </div>
      )}
    </div>
  );
}
