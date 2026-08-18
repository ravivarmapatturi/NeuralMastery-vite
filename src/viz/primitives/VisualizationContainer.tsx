import React from 'react';
import { useVizTokens, RADIUS, SPACING, FONT_FAMILY } from '../../theme/vizTokens';

/**
 * The outer frame every visualization renders inside -- background, border,
 * radius, shadow, responsive width. Composes with VisualizationHeader,
 * VisualizationControls, VisualizationCanvas, etc. inside it. Matches the
 * static diagram card look (see visualize/templates/card.html.j2) so an
 * interactive component reads as native next to the site's generated charts.
 */
export default function VisualizationContainer({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useVizTokens();

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        margin: `${SPACING.md}px 0`,
        boxShadow: t.mode === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 8px 24px rgba(20, 22, 26, 0.08)',
        fontFamily: FONT_FAMILY,
        color: t.textPrimary,
      }}
    >
      {children}
      {footer && (
        <div
          style={{
            marginTop: SPACING.sm,
            paddingTop: SPACING.sm,
            borderTop: `1px solid ${t.border}`,
            fontSize: 13,
            color: t.textSecondary,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
