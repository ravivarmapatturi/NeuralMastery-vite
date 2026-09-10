import { useId } from 'react';
import type { RankTier } from '../lib/rankTiers';

const HEX_FRAME = 'M32,4 L56.2,18 L56.2,46 L32,60 L7.8,46 L7.8,18 Z';
const DIAMOND = 'M32,20 L44,32 L32,44 L20,32 Z';
const STAR = 'M32,18 L35.5,27.2 L45.3,27.7 L37.7,33.9 L40.2,43.3 L32,38 L23.8,43.3 L26.3,33.9 L18.7,27.7 L28.5,27.2 Z';

/** Real, hand-drawn inner glyph per tier -- escalating visual weight from
 * a single plain pip (Initiate) to a radiant 8-ray starburst (Neural Legend),
 * never a reused/generic icon. All 10 share the same hexagonal "shield" frame
 * (see HEX_FRAME) for visual cohesion across the progression ladder. */
function Glyph({ tierId, glyphColor, tierColor }: { tierId: string; glyphColor: string; tierColor: string }) {
  switch (tierId) {
    case 'initiate':
      return <circle cx="32" cy="32" r="4.5" fill={glyphColor} />;
    case 'apprentice':
      return (
        <>
          <circle cx="26" cy="32" r="3.8" fill={glyphColor} />
          <circle cx="38" cy="32" r="3.8" fill={glyphColor} />
        </>
      );
    case 'explorer':
      return (
        <>
          <circle cx="32" cy="23" r="3.8" fill={glyphColor} />
          <circle cx="24.5" cy="37" r="3.8" fill={glyphColor} />
          <circle cx="39.5" cy="37" r="3.8" fill={glyphColor} />
        </>
      );
    case 'builder':
      return (
        <>
          <path d="M22,39 L32,24 L42,39 Z" fill={glyphColor} />
          <rect x="20" y="39" width="24" height="4" rx="1" fill={glyphColor} />
          <circle cx="32" cy="19" r="2" fill={glyphColor} />
        </>
      );
    case 'practitioner':
      return <path d={DIAMOND} fill="none" stroke={glyphColor} strokeWidth="3" strokeLinejoin="round" />;
    case 'specialist':
      return <path d={DIAMOND} fill={glyphColor} />;
    case 'expert':
      return (
        <>
          <path d="M18,40 L21,25 L28,35 L32,21 L36,35 L43,25 L46,40 Z" fill={glyphColor} strokeLinejoin="round" />
          <rect x="17" y="40" width="30" height="4.5" rx="1.5" fill={glyphColor} />
        </>
      );
    case 'master':
      return <path d={STAR} fill="none" stroke={glyphColor} strokeWidth="2.5" strokeLinejoin="round" />;
    case 'grandmaster':
      return (
        <>
          <path d={STAR} fill={glyphColor} />
          <circle cx="32" cy="11" r="2.2" fill={glyphColor} />
          <circle cx="51" cy="32" r="2.2" fill={glyphColor} />
          <circle cx="32" cy="51" r="2.2" fill={glyphColor} />
          <circle cx="13" cy="32" r="2.2" fill={glyphColor} />
        </>
      );
    case 'neurallegend':
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 32 + 18 * Math.cos(angle);
            const y1 = 32 + 18 * Math.sin(angle);
            const x2 = 32 + 24 * Math.cos(angle);
            const y2 = 32 + 24 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={glyphColor} strokeWidth="2.5" strokeLinecap="round" />;
          })}
          <path d={STAR} fill={glyphColor} />
          <circle cx="32" cy="32" r="3" fill={tierColor} />
        </>
      );
    default:
      return null;
  }
}

/**
 * Real, distinct SVG badge for a rank tier (see lib/rankTiers.ts) --
 * layered visually on top of the existing points/level system.
 *
 * Tier animations escalate smoothly:
 * - Lower tiers (Initiate, Apprentice, Explorer): clean, static.
 * - Mid tiers (Builder, Practitioner, Specialist): subtle ambient aura.
 * - Top tiers (Expert, Master, Grandmaster, Neural Legend): active glow pulse + diagonal shimmer sweep.
 *
 * Fully respects `prefers-reduced-motion` by freezing animations and suppressing shimmer motion.
 */
export default function RankBadge({ tier, size = 28, showLabel = false }: { tier: RankTier; size?: number; showLabel?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `hex-clip-${uid}`;
  const shimmerGradId = `hex-shimmer-${uid}`;

  // Visual animation escalation based on tier id
  const isTopTier = ['expert', 'master', 'grandmaster', 'neurallegend'].includes(tier.id);
  const isLegend = tier.id === 'neurallegend';
  const isGrandmaster = tier.id === 'grandmaster';
  const isMidTier = ['builder', 'practitioner', 'specialist'].includes(tier.id);

  const glowStyle: React.CSSProperties = isLegend
    ? { filter: `drop-shadow(0 0 ${Math.max(4, size * 0.15)}px ${tier.color}) drop-shadow(0 0 ${Math.max(8, size * 0.3)}px rgba(245, 158, 11, 0.45))` }
    : isGrandmaster
    ? { filter: `drop-shadow(0 0 ${Math.max(3, size * 0.12)}px ${tier.color})` }
    : isTopTier
    ? { filter: `drop-shadow(0 0 ${Math.max(2, size * 0.08)}px ${tier.color}88)` }
    : isMidTier
    ? { filter: `drop-shadow(0 0 ${Math.max(1, size * 0.05)}px ${tier.color}55)` }
    : {};

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        verticalAlign: 'middle',
      }}
    >
      <style>{`
        @keyframes nm-rank-shimmer-sweep {
          0% { transform: translate(-70px, -70px) rotate(35deg); opacity: 0; }
          15% { opacity: 0.85; }
          40% { transform: translate(70px, 70px) rotate(35deg); opacity: 0; }
          100% { transform: translate(70px, 70px) rotate(35deg); opacity: 0; }
        }
        @keyframes nm-rank-glow-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .nm-rank-badge-top {
          animation: nm-rank-glow-pulse 3.5s ease-in-out infinite;
        }
        .nm-rank-badge-legend {
          animation: nm-rank-glow-pulse 2.5s ease-in-out infinite;
        }
        .nm-rank-shimmer-rect {
          animation: nm-rank-shimmer-sweep 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .nm-rank-badge-top,
          .nm-rank-badge-legend,
          .nm-rank-shimmer-rect {
            animation: none !important;
            transform: none !important;
          }
          .nm-rank-shimmer-rect {
            display: none !important;
          }
        }
      `}</style>

      <div
        className={isLegend ? 'nm-rank-badge-legend' : isTopTier ? 'nm-rank-badge-top' : undefined}
        style={{
          display: 'inline-flex',
          position: 'relative',
          lineHeight: 0,
          ...glowStyle,
          transition: 'filter 0.3s ease',
        }}
      >
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ overflow: 'visible' }}>
          <defs>
            <clipPath id={clipId}>
              <path d={HEX_FRAME} />
            </clipPath>
            <linearGradient id={shimmerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Hexagonal shield background */}
          <path d={HEX_FRAME} fill={tier.color} stroke="color-mix(in srgb, black 25%, transparent)" strokeWidth="1.5" />
          <path
            d={HEX_FRAME}
            fill="none"
            stroke="color-mix(in srgb, white 38%, transparent)"
            strokeWidth="1.2"
            transform="scale(0.92) translate(2.8, 2.8)"
          />

          {/* Hand-drawn tier glyph */}
          <Glyph tierId={tier.id} glyphColor="var(--nm-bg)" tierColor={tier.color} />

          {/* Diagonal shimmer sweep overlay on top tiers */}
          {isTopTier && (
            <g clipPath={`url(#${clipId})`}>
              <rect
                className="nm-rank-shimmer-rect"
                x="12"
                y="12"
                width="40"
                height="100"
                fill={`url(#${shimmerGradId})`}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
      </div>

      {showLabel && (
        <span style={{ fontSize: 13, fontWeight: 700, color: tier.color, letterSpacing: '-0.01em' }}>
          {tier.label}
        </span>
      )}
    </div>
  );
}
