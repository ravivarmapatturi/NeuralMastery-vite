import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PracticeProblem } from '../../lib/practiceProblem';
import VectorOpsPlayground, { getVectorOpSpec } from './VectorOpsPlayground';
import {
  ClockIcon,
  SparkleIcon,
  ZapIcon,
  BookOpenIcon,
  GoldMasteryIcon,
  BronzeMasteryIcon,
} from '../icons/PracticeIcons';
import type { MasteryTier } from '../../lib/gamification';

interface ProblemPanelProps {
  problem: PracticeProblem;
  mdxContent?: React.ReactNode;
  solved?: boolean;
  masteryTier?: MasteryTier | null;
  onHintViewed?: () => void;
  onExpandFocus?: () => void;
  isFocused?: boolean;
}

const DIFFICULTY_ACCENT: Record<string, string> = {
  easy: 'var(--nm-accent-primary)',
  medium: 'var(--nm-accent-warn)',
  hard: 'var(--nm-accent-danger)',
};

export default function ProblemPanel({
  problem,
  mdxContent,
  solved,
  masteryTier,
  onHintViewed,
  onExpandFocus,
  isFocused,
}: ProblemPanelProps) {
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'intuition'>('problem');

  const difficultyColor = DIFFICULTY_ACCENT[problem.difficulty] ?? 'var(--nm-accent-danger)';
  const vectorOpSpec = getVectorOpSpec(problem);

  const handleSelectHintLevel = (level: number) => {
    setHintLevel(level);
    if (level > 0 && onHintViewed) {
      onHintViewed();
    }
  };

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
          padding: '8px 12px',
          borderBottom: '1px solid var(--nm-border)',
          background: 'var(--nm-surface-alt)',
          flexWrap: 'wrap',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('problem')}
            style={{
              background: activeTab === 'problem' ? 'var(--nm-surface)' : 'transparent',
              border: `1px solid ${activeTab === 'problem' ? 'var(--nm-border)' : 'transparent'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === 'problem' ? 'var(--nm-text-primary)' : 'var(--nm-text-muted)',
              cursor: 'pointer',
            }}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intuition')}
            style={{
              background: activeTab === 'intuition' ? 'var(--nm-surface)' : 'transparent',
              border: `1px solid ${activeTab === 'intuition' ? 'var(--nm-border)' : 'transparent'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === 'intuition' ? 'var(--nm-text-primary)' : 'var(--nm-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>Worked Intuition</span>
            {vectorOpSpec && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'color-mix(in srgb, var(--nm-accent-secondary) 15%, transparent)',
                  color: 'var(--nm-accent-secondary)',
                }}
              >
                Interactive
              </span>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            style={{
              background: 'transparent',
              border: '1px solid var(--nm-border)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: showAiDrawer ? 'var(--nm-accent-purple)' : 'var(--nm-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <SparkleIcon size={14} color="var(--nm-accent-purple)" />
            <span>Need Help?</span>
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
              {isFocused ? 'Exit Focus' : 'Focus'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(12px, 3vw, 20px)' }}>
        {activeTab === 'problem' ? (
          <div style={{ maxWidth: '100%', overflowWrap: 'break-word' }}>
            {/* Title & Understated Metadata Badges */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: '0 0 12px', fontSize: 21, fontWeight: 700, color: 'var(--nm-text-primary)', overflowWrap: 'break-word' }}>
                {problem.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {/* One primary accent: Difficulty */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: `color-mix(in srgb, ${difficultyColor} 12%, transparent)`,
                    color: difficultyColor,
                    border: `1px solid color-mix(in srgb, ${difficultyColor} 25%, transparent)`,
                  }}
                >
                  {problem.difficulty}
                </span>

                {/* Neutral topic pill */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--nm-surface-alt)',
                    color: 'var(--nm-text-secondary)',
                    border: '1px solid var(--nm-border)',
                  }}
                >
                  {problem.topic}
                </span>

                {/* Neutral time pill */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: 4,
                    color: 'var(--nm-text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ClockIcon size={12} color="var(--nm-text-muted)" />
                  {problem.estimatedTime}
                </span>

                {/* Solved Mastery Tier Pill (Gold vs Bronze) */}
                {solved && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background:
                        masteryTier === 'gold'
                          ? 'color-mix(in srgb, var(--nm-accent-warn) 12%, transparent)'
                          : 'color-mix(in srgb, var(--nm-accent-primary) 12%, transparent)',
                      color:
                        masteryTier === 'gold'
                          ? 'var(--nm-accent-warn)'
                          : 'var(--nm-accent-primary)',
                      border: `1px solid ${
                        masteryTier === 'gold'
                          ? 'color-mix(in srgb, var(--nm-accent-warn) 30%, transparent)'
                          : 'color-mix(in srgb, var(--nm-accent-primary) 30%, transparent)'
                      }`,
                    }}
                    title={
                      masteryTier === 'gold'
                        ? 'Solved independently without viewing hints'
                        : 'Solved with hint guidance'
                    }
                  >
                    {masteryTier === 'gold' ? (
                      <>
                        <GoldMasteryIcon size={13} color="var(--nm-accent-warn)" />
                        Solved independently
                      </>
                    ) : (
                      <>
                        <BronzeMasteryIcon size={13} color="var(--nm-accent-primary)" />
                        Solved with hints
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Clean Library Policy Banner (No rainbow gradient) */}
              {problem.libraryPolicyText && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--nm-surface-alt)',
                    border: '1px solid var(--nm-border)',
                    borderLeft: '3px solid var(--nm-accent-secondary)',
                    color: 'var(--nm-text-secondary)',
                    fontSize: 12,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <ZapIcon size={14} color="var(--nm-accent-secondary)" />
                  <span>{problem.libraryPolicyText}</span>
                </div>
              )}
            </div>

            {/* Mission Box: Whitespace and typographic discipline */}
            <div
              style={{
                borderLeft: '3px solid var(--nm-accent-secondary)',
                padding: '8px 14px',
                background: 'color-mix(in srgb, var(--nm-accent-secondary) 6%, var(--nm-surface))',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--nm-accent-secondary)',
                  marginBottom: 4,
                }}
              >
                Mission
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--nm-text-primary)' }}>
                {problem.mission}
              </div>
            </div>

            {/* Item 2: Why This Matters Block */}
            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--nm-text-muted)',
                  marginBottom: 6,
                }}
              >
                Why This Matters
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--nm-text-secondary)', marginBottom: 12 }}>
                {problem.mission}
              </div>

              {/* Used In: Horizontal chip row */}
              {problem.conceptConnections && problem.conceptConnections.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--nm-text-muted)',
                      marginBottom: 8,
                    }}
                  >
                    Used In
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {problem.conceptConnections.map((conn, i) => (
                      <Link
                        key={i}
                        to={conn.route}
                        title={conn.description}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          color: 'var(--nm-text-primary)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: 'var(--nm-surface-alt)',
                          border: '1px solid var(--nm-border)',
                          textDecoration: 'none',
                        }}
                      >
                        <BookOpenIcon size={13} color="var(--nm-accent-secondary)" />
                        <span>{conn.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Task Description */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--nm-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Task
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, color: 'var(--nm-text-primary)' }}>
                {problem.taskDescription}
              </p>
            </div>

            {/* Expected Function Signature */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--nm-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  fontSize: 12.5,
                  color: 'var(--nm-text-primary)',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {problem.functionSignature}
              </pre>
            </div>

            {/* Examples Preview */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--nm-text-muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {problem.testCases
                  .filter((tc) => !tc.hidden)
                  .map((tc, idx) => (
                    <div
                      key={tc.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 6,
                        background: 'var(--nm-surface-alt)',
                        border: '1px solid var(--nm-border)',
                        fontSize: 12.5,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--nm-text-secondary)', marginBottom: 4, fontFamily: 'inherit' }}>
                        Example {idx + 1}: {tc.label}
                      </div>
                      <div style={{ color: 'var(--nm-text-primary)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        <span style={{ color: 'var(--nm-text-muted)' }}>Input: </span>
                        {JSON.stringify(tc.input)}
                      </div>
                      <div style={{ color: 'var(--nm-accent-primary)', marginTop: 3, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        <span style={{ color: 'var(--nm-text-muted)' }}>Output: </span>
                        {tc.expectError ? `Raises ${tc.expectError}` : JSON.stringify(tc.expectedOutput)}
                      </div>
                      {tc.description && (
                        <div style={{ color: 'var(--nm-text-muted)', fontSize: 12, marginTop: 4, fontFamily: 'sans-serif', overflowWrap: 'break-word' }}>
                          Explanation: {tc.description}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--nm-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Constraints
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: 'var(--nm-text-primary)' }}>
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          /* Intuition Tab: Shows VectorOpsPlayground if applicable, plus MDX */
          <div>
            {vectorOpSpec && (
              <VectorOpsPlayground spec={vectorOpSpec} />
            )}

            {mdxContent ? (
              <div style={{ marginTop: vectorOpSpec ? 16 : 0 }}>
                {mdxContent}
              </div>
            ) : !vectorOpSpec ? (
              <div style={{ lineHeight: 1.6, color: 'var(--nm-text-primary)', fontSize: 13.5 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Mathematical Intuition</h3>
                <p>
                  For vectors $a$ and $b$, the dot product computes $a \cdot b = \sum_i a_i b_i$. It pairs corresponding coordinates, multiplies them, and sums the total.
                </p>
                <p>
                  In modern Machine Learning, dot products quantify vector alignment, form matrix multiplications (A · B), and drive self-attention mechanisms (Q · K^T / sqrt(d_k)).
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Progressive AI Assistance Drawer */}
      {showAiDrawer && problem.hints && (
        <div
          style={{
            borderTop: '1px solid var(--nm-border)',
            background: 'var(--nm-surface-alt)',
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--nm-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <SparkleIcon size={14} color="var(--nm-accent-purple)" />
              <span>Progressive Guidance</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAiDrawer(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--nm-text-muted)', cursor: 'pointer', fontSize: 13 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => handleSelectHintLevel(1)}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${hintLevel >= 1 ? 'var(--nm-accent-purple)' : 'var(--nm-border)'}`,
                background: hintLevel >= 1 ? 'color-mix(in srgb, var(--nm-accent-purple) 15%, transparent)' : 'var(--nm-surface)',
                color: hintLevel >= 1 ? 'var(--nm-accent-purple)' : 'var(--nm-text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hint 1: Direction
            </button>
            <button
              type="button"
              onClick={() => handleSelectHintLevel(2)}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${hintLevel >= 2 ? 'var(--nm-accent-purple)' : 'var(--nm-border)'}`,
                background: hintLevel >= 2 ? 'color-mix(in srgb, var(--nm-accent-purple) 15%, transparent)' : 'var(--nm-surface)',
                color: hintLevel >= 2 ? 'var(--nm-accent-purple)' : 'var(--nm-text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hint 2: Approach
            </button>
            <button
              type="button"
              onClick={() => handleSelectHintLevel(3)}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${hintLevel >= 3 ? 'var(--nm-accent-purple)' : 'var(--nm-border)'}`,
                background: hintLevel >= 3 ? 'color-mix(in srgb, var(--nm-accent-purple) 15%, transparent)' : 'var(--nm-surface)',
                color: hintLevel >= 3 ? 'var(--nm-accent-purple)' : 'var(--nm-text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Key Concept
            </button>
          </div>

          {hintLevel === 0 && (
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>
              Select a guidance level above to see hints without spoiling the answer.
            </div>
          )}
          {hintLevel >= 1 && (
            <div style={{ fontSize: 13, color: 'var(--nm-text-primary)', marginBottom: 8, lineHeight: 1.5 }}>
              <strong>Hint 1:</strong> {problem.hints.small}
            </div>
          )}
          {hintLevel >= 2 && (
            <div style={{ fontSize: 13, color: 'var(--nm-text-primary)', marginBottom: 8, lineHeight: 1.5 }}>
              <strong>Hint 2:</strong> {problem.hints.strong}
            </div>
          )}
          {hintLevel >= 3 && (
            <div style={{ fontSize: 13, color: 'var(--nm-text-primary)', lineHeight: 1.5 }}>
              <strong>Concept:</strong> {problem.hints.concept}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
