import React, { useEffect, useRef, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * A responsive mount point for D3/canvas/SVG visualizations. Tracks its own
 * container width via ResizeObserver and hands {width, height} to a
 * render-prop child, so every visualization is responsive without
 * re-deriving this logic per component.
 */
export default function VisualizationCanvas({
  aspect = 16 / 9,
  minHeight = 280,
  maxHeight = 560,
  children,
}: {
  aspect?: number;
  minHeight?: number;
  maxHeight?: number;
  children: (size: Size) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 600, height: Math.max(minHeight, 600 / aspect) });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const height = Math.min(maxHeight, Math.max(minHeight, width / aspect));
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspect, minHeight, maxHeight]);

  return <div ref={containerRef} style={{ width: '100%' }}>{children(size)}</div>;
}

/** True when the user's OS/browser requests reduced motion -- every animated
 * visualization should check this and either skip transitions or jump
 * straight to end-states instead of animating. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
