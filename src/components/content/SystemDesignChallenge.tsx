import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useVizTokens, RADIUS, SPACING, FONT_FAMILY } from '../../theme/vizTokens';
import { useGamification } from '../../contexts/GamificationContext';
import { normalizeRoute } from '../../lib/contentTree';

/**
 * The site's first practice-problem type with no automated grading, by
 * deliberate choice, not an oversight -- a real end-to-end system design
 * has no single correct answer an assert or a compiled-shader readback
 * could check, and building against an LLM-grading API that doesn't exist
 * yet (this app has no backend beyond Firebase) isn't the honest v1 move.
 * Instead: write a real free-text design, then self-assess against a real
 * rubric (extracted from the actual case-study's own discovery sequence,
 * not invented separately) and the site's own already-written walkthrough
 * for that exact problem.
 *
 * Points are awarded on reveal, not on any correctness check -- genuinely
 * different from RunnableCode/RunnableWebGPU, which only award once every
 * test actually passes. This is a deliberate, honest tradeoff: revealing
 * is a real signal of having actually engaged (chosen to compare your own
 * answer against a real one) even though it can't verify the answer's
 * quality the way a real test can. The textarea requiring real, non-empty
 * text before the reveal button enables is the one enforced floor against
 * an empty click-through.
 */
export default function SystemDesignChallenge({ rubric, caseStudyHref }: { rubric: string[]; caseStudyHref: string }) {
  const t = useVizTokens();
  const { awardSystemDesignCompleted } = useGamification();
  const permalink = normalizeRoute(useLocation().pathname);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RADIUS.md, margin: `${SPACING.sm}px 0`, background: t.surfaceAlt, fontFamily: FONT_FAMILY, overflow: 'hidden' }}>
      <div style={{ padding: `${SPACING.xs}px ${SPACING.sm}px`, borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.accentTeal }}>Design Challenge</span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your end-to-end system design here -- there's no fixed length or format. Walk through the real constraints as you'd actually hit them, then reveal the rubric when you're done."
        rows={14}
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

      <div style={{ padding: SPACING.sm, borderTop: `1px solid ${t.border}` }}>
        {!revealed ? (
          <button
            type="button"
            onClick={() => {
              setRevealed(true);
              awardSystemDesignCompleted(permalink);
            }}
            disabled={answer.trim().length === 0}
            style={{
              cursor: answer.trim().length === 0 ? 'not-allowed' : 'pointer',
              padding: '6px 14px',
              borderRadius: RADIUS.sm,
              fontSize: 12.5,
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              border: `1px solid ${t.accentPrimary}`,
              background: t.accentPrimary,
              color: t.background,
              opacity: answer.trim().length === 0 ? 0.6 : 1,
            }}
          >
            Reveal rubric &amp; the real walkthrough
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 }}>
              Self-assessment rubric — did your design address:
            </div>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {rubric.map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
            </ul>
            <Link to={caseStudyHref} style={{ fontSize: 13, color: t.accentPrimary, textDecoration: 'none', fontWeight: 600 }}>
              Compare against the real walkthrough for this problem →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
