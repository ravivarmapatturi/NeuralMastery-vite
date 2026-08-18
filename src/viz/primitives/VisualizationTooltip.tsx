import React from 'react';
import { useVizTokens, RADIUS } from '../../theme/vizTokens';

/**
 * A controlled, positioned tooltip -- render inside a `position: relative`
 * ancestor (VisualizationCanvas's wrapper div already is one) and drive
 * x/y/visible from whatever hover/pointer state the visualization tracks.
 */
export default function VisualizationTooltip({
  x,
  y,
  visible,
  children,
}: {
  x: number;
  y: number;
  visible: boolean;
  children: React.ReactNode;
}) {
  const t = useVizTokens();
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        marginTop: -8,
        background: t.surfaceAlt,
        border: `1px solid ${t.border}`,
        borderRadius: RADIUS.sm,
        padding: '6px 10px',
        fontSize: 12,
        color: t.textPrimary,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
