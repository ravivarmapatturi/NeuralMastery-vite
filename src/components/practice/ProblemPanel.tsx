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

export default function ProblemPanel({ problem, mdxContent, solved, onExpandFocus, isFocused }: ProblemPanelProps) {
  const t = useVizTokens();
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'intuition'>('problem');

  const difficultyColor =
    problem.difficulty === 'easy' ? '#10b981' : problem.difficulty === 'medium' ? '#f59e0b' : '#ef4444';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--nm-surface, #0f172a)',
        color: 'var(--nm-text-primary, #f8fafc)',
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
          borderBottom: '1px solid var(--nm-border, rgba(255,255,255,0.1))',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setActiveTab('problem')}
            style={{
              background: activeTab === 'problem' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: `1px solid ${activeTab === 'problem' ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === 'problem' ? '#818cf8' : 'var(--nm-text-muted, #94a3b8)',
              cursor: 'pointer',
            }}
          >
            📋 Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intuition')}
            style={{
              background: activeTab === 'intuition' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: `1px solid ${activeTab === 'intuition' ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === 'intuition' ? '#818cf8' : 'var(--nm-text-muted, #94a3b8)',
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
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: '#c084fc',
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
                border: '1px solid var(--nm-border, rgba(255,255,255,0.15))',
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
              <h1 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: 'var(--nm-text-heading, #f8fafc)' }}>
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
                    background: `${difficultyColor}20`,
                    color: difficultyColor,
                    border: `1px solid ${difficultyColor}40`,
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
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--nm-text-muted, #94a3b8)',
                    border: '1px solid var(--nm-border, rgba(255,255,255,0.1))',
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
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    ✓ Solved
                  </span>
                )}
              </div>
            </div>

            {/* Mission Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                borderLeft: '4px solid #6366f1',
                borderRadius: '0 8px 8px 0',
                padding: '12px 16px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', marginBottom: 4 }}>
                🎯 Mission
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#e2e8f0' }}>{problem.mission}</div>
            </div>

            {/* Task Description */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Task
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: '#cbd5e1' }}>{problem.taskDescription}</p>
            </div>

            {/* Expected Function Signature */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Function Signature
              </h3>
              <pre
                style={{
                  margin: 0,
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: '#020617',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: 13,
                  color: '#38bdf8',
                }}
              >
                {problem.functionSignature}
              </pre>
            </div>

            {/* Examples Preview */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                        background: '#020617',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: 13,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 6, fontFamily: 'inherit' }}>
                        Example {idx + 1}: {tc.label}
                      </div>
                      <div style={{ color: '#cbd5e1' }}>
                        <span style={{ color: '#64748b' }}>Input: </span>
                        {JSON.stringify(tc.input)}
                      </div>
                      <div style={{ color: '#34d399', marginTop: 4 }}>
                        <span style={{ color: '#64748b' }}>Output: </span>
                        {tc.expectError ? `Raises ${tc.expectError}` : JSON.stringify(tc.expectedOutput)}
                      </div>
                      {tc.description && (
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                          Explanation: {tc.description}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Constraints
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 1.6, color: '#cbd5e1' }}>
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
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
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
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>{conn.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{conn.description}</div>
                      </div>
                      <Link
                        to={conn.route}
                        style={{
                          fontSize: 12,
                          color: '#818cf8',
                          textDecoration: 'none',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'rgba(99, 102, 241, 0.1)',
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
              <div style={{ lineHeight: 1.6, color: '#cbd5e1', fontSize: 14 }}>
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
            borderTop: '1px solid rgba(168, 85, 247, 0.3)',
            background: 'rgba(15, 23, 42, 0.95)',
            padding: 16,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✨</span> AI Progressive Guidance
            </span>
            <button
              type="button"
              onClick={() => setShowAiDrawer(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}
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
                border: '1px solid rgba(168, 85, 247, 0.4)',
                background: hintLevel >= 1 ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: '#e9d5ff',
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
                border: '1px solid rgba(168, 85, 247, 0.4)',
                background: hintLevel >= 2 ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: '#e9d5ff',
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
                border: '1px solid rgba(168, 85, 247, 0.4)',
                background: hintLevel >= 3 ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: '#e9d5ff',
                cursor: 'pointer',
              }}
            >
              Concept Explanation
            </button>
          </div>

          {hintLevel === 0 && <div style={{ fontSize: 12.5, color: '#94a3b8' }}>Select a hint level above to receive progressive guidance without spoiling the answer.</div>}
          {hintLevel >= 1 && <div style={{ fontSize: 13, color: '#f3e8ff', marginBottom: 8 }}>💡 <strong>Hint 1:</strong> {problem.hints.small}</div>}
          {hintLevel >= 2 && <div style={{ fontSize: 13, color: '#f3e8ff', marginBottom: 8 }}>🚀 <strong>Hint 2:</strong> {problem.hints.strong}</div>}
          {hintLevel >= 3 && <div style={{ fontSize: 13, color: '#f3e8ff' }}>🎓 <strong>Concept:</strong> {problem.hints.concept}</div>}
        </div>
      )}
    </div>
  );
}
