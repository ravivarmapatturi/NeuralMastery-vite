import { useEffect, useRef, useState } from 'react';
import { scaleLinear } from 'd3';
import { RADIUS, type VizTokens } from '../../theme/vizTokens';
import { hexToRgb, blendColor } from '../lib/colorBlend';

export interface GDPathStep {
  w: number;
  b: number;
}

/**
 * A cost(w, b) heatmap over a 2D parameter grid, with a gradient-descent
 * path drawn on top -- identical between Linear and Logistic Regression
 * Studios (only the cost function and color caption differ), extracted
 * here after porting both revealed the same canvas drawing code.
 */
export default function LossLandscapeHeatmap({
  wDomain,
  bDomain,
  costFn,
  path,
  t,
  caption,
}: {
  wDomain: [number, number];
  bDomain: [number, number];
  costFn: (w: number, b: number) => number;
  path: GDPathStep[];
  t: VizTokens;
  caption: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(340);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => setSize(Math.min(420, entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const GRID = 36;

    const wScale = scaleLinear().domain(wDomain).range([0, w]);
    const bScale = scaleLinear().domain(bDomain).range([h, 0]);
    const wInv = scaleLinear().domain([0, w]).range(wDomain);
    const bInv = scaleLinear().domain([0, h]).range(bDomain);

    const costs: number[][] = [];
    let maxCost = 0;
    for (let gx = 0; gx < GRID; gx++) {
      const row: number[] = [];
      for (let gy = 0; gy < GRID; gy++) {
        const wv = wInv((gx + 0.5) * (w / GRID));
        const bv = bInv((gy + 0.5) * (h / GRID));
        const cost = costFn(wv, bv);
        row.push(cost);
        if (cost > maxCost) maxCost = cost;
      }
      costs.push(row);
    }
    const norm = Math.sqrt(maxCost) || 1;

    const low = hexToRgb(t.accentPrimary);
    const high = hexToRgb(t.accentDanger);
    const cell = w / GRID;
    for (let gx = 0; gx < GRID; gx++) {
      for (let gy = 0; gy < GRID; gy++) {
        const tNorm = Math.min(1, Math.sqrt(costs[gx][gy]) / norm);
        ctx.fillStyle = blendColor(low, high, tNorm);
        ctx.globalAlpha = 0.55;
        ctx.fillRect(gx * cell, gy * cell, cell + 1, cell + 1);
      }
    }
    ctx.globalAlpha = 1;

    if (path.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = t.textPrimary;
      ctx.lineWidth = 2;
      path.forEach((s, i) => {
        const px = wScale(s.w);
        const py = bScale(s.b);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    const last = path[path.length - 1];
    if (last && isFinite(last.w) && isFinite(last.b)) {
      ctx.beginPath();
      ctx.arc(wScale(last.w), bScale(last.b), 5, 0, 2 * Math.PI);
      ctx.fillStyle = t.textPrimary;
      ctx.fill();
    }
  }, [wDomain, bDomain, costFn, path, size, t]);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size * 0.68}
        style={{ width: '100%', height: size * 0.68, borderRadius: RADIUS.md, border: `1px solid ${t.border}`, display: 'block' }}
      />
      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{caption}</div>
    </div>
  );
}
