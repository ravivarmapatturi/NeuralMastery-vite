import React from 'react';
import { useVizTokens, SPACING } from '../../theme/vizTokens';

export default function VisualizationHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title?: string;
  description?: React.ReactNode;
}) {
  const t = useVizTokens();
  return (
    <div style={{ marginBottom: SPACING.sm }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: t.accentPrimary,
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </div>
      )}
      {title && <div style={{ fontSize: 20, fontWeight: 700, marginBottom: description ? 6 : 0 }}>{title}</div>}
      {description && <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.5 }}>{description}</div>}
    </div>
  );
}
