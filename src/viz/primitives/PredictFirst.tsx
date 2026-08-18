import { useState } from 'react';
import { useVizTokens, RADIUS, SPACING, FONT_FAMILY } from '../../theme/vizTokens';

/**
 * A small "predict, then reveal" widget -- pick an answer before you touch
 * the Studio above, then check yourself. No scoring/progress tracking, just
 * the single mechanic both internal and external gap reports flagged as the
 * highest-leverage curiosity driver: commit to a prediction before running
 * the experiment that proves or breaks it.
 */
export default function PredictFirst({
  question,
  options,
  correctIndex,
  explanation,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const t = useVizTokens();
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;

  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        margin: `${SPACING.sm}px 0`,
        background: t.surfaceAlt,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: t.accentWarn,
          marginBottom: 6,
        }}
      >
        Predict First
      </div>
      <div style={{ fontSize: 15, color: t.textPrimary, marginBottom: 10 }}>{question}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;
          let bg = t.surface;
          let border = t.border;
          let color = t.textPrimary;
          if (revealed && isCorrect) {
            bg = t.accentPrimary;
            border = t.accentPrimary;
            color = t.background;
          } else if (revealed && isSelected && !isCorrect) {
            bg = t.accentDanger;
            border = t.accentDanger;
            color = t.background;
          }
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => setSelected(i)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: RADIUS.sm,
                border: `1px solid ${border}`,
                background: bg,
                color,
                fontSize: 14,
                fontFamily: FONT_FAMILY,
                cursor: revealed ? 'default' : 'pointer',
                fontWeight: revealed && isCorrect ? 700 : 400,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div style={{ marginTop: 10, fontSize: 13, color: t.textSecondary, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
          <strong style={{ color: selected === correctIndex ? t.accentPrimary : t.accentDanger }}>
            {selected === correctIndex ? 'Correct. ' : 'Not quite. '}
          </strong>
          {explanation}
        </div>
      )}
    </div>
  );
}
