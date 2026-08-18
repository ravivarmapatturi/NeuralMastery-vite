import React from 'react';
import { useVizTokens, RADIUS, SPACING } from '../../theme/vizTokens';

/**
 * The "why is this happening right now" copy, tied to whatever step/state a
 * visualization is currently in. Distinct from VisualizationHeader's static
 * description -- this box is meant to update as the learner steps through
 * or interacts, explaining the *current* moment, not the concept overall.
 */
export default function VisualizationExplanation({ children }: { children: React.ReactNode }) {
  const t = useVizTokens();
  return (
    <div
      style={{
        marginTop: SPACING.sm,
        padding: `${SPACING.xs}px ${SPACING.sm}px`,
        background: t.surfaceAlt,
        borderLeft: `3px solid ${t.accentPrimary}`,
        borderRadius: RADIUS.sm,
        fontSize: 14,
        lineHeight: 1.55,
        color: t.textPrimary,
      }}
    >
      {children}
    </div>
  );
}
