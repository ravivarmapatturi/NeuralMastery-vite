import type { RankTier } from '../lib/rankTiers';

const HEX_FRAME = 'M32,4 L56.2,18 L56.2,46 L32,60 L7.8,46 L7.8,18 Z';
const DIAMOND = 'M32,20 L44,32 L32,44 L20,32 Z';
const STAR = 'M32,18 L35.5,27.2 L45.3,27.7 L37.7,33.9 L40.2,43.3 L32,38 L23.8,43.3 L26.3,33.9 L18.7,27.7 L28.5,27.2 Z';

/** Real, hand-drawn inner glyph per tier -- escalating visual weight from
 * a single plain pip (Bronze) to a filled radiant star (Conqueror), never
 * a reused/generic icon (no medal emoji, no copy of BGMI's own art). All
 * 8 share the same hexagonal "shield" frame (see HEX_FRAME) on purpose --
 * one consistent, site-native badge silhouette, differentiated by real
 * glyph + real tier color, the same way this site's own DomainIcon system
 * reuses one visual language across many distinct icons. */
function Glyph({ tierId, glyphColor }: { tierId: string; glyphColor: string }) {
  switch (tierId) {
    case 'bronze':
      return <circle cx="32" cy="32" r="5" fill={glyphColor} />;
    case 'silver':
      return (
        <>
          <circle cx="26" cy="32" r="4" fill={glyphColor} />
          <circle cx="38" cy="32" r="4" fill={glyphColor} />
        </>
      );
    case 'gold':
      return (
        <>
          <circle cx="32" cy="23" r="4" fill={glyphColor} />
          <circle cx="24.5" cy="37" r="4" fill={glyphColor} />
          <circle cx="39.5" cy="37" r="4" fill={glyphColor} />
        </>
      );
    case 'platinum':
      return <path d={DIAMOND} fill="none" stroke={glyphColor} strokeWidth="3" strokeLinejoin="round" />;
    case 'diamond':
      return <path d={DIAMOND} fill={glyphColor} />;
    case 'crown':
      return (
        <>
          <path d="M18,40 L21,25 L28,35 L32,21 L36,35 L43,25 L46,40 Z" fill={glyphColor} strokeLinejoin="round" />
          <rect x="17" y="40" width="30" height="5" rx="1.5" fill={glyphColor} />
        </>
      );
    case 'ace':
      return <path d={STAR} fill="none" stroke={glyphColor} strokeWidth="2.5" strokeLinejoin="round" />;
    case 'conqueror':
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 32 + 17 * Math.cos(angle);
            const y1 = 32 + 17 * Math.sin(angle);
            const x2 = 32 + 22 * Math.cos(angle);
            const y2 = 32 + 22 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={glyphColor} strokeWidth="2" strokeLinecap="round" />;
          })}
          <path d={STAR} fill={glyphColor} />
        </>
      );
    default:
      return null;
  }
}

/**
 * Real, distinct SVG badge for a rank tier (see lib/rankTiers.ts) --
 * layered visually on top of the existing points/level system, never
 * replacing the Level N / XP bar already on the profile page. Sized via
 * `size` (defaults to a compact inline badge); pass a larger size for the
 * profile page's prominent placement.
 */
export default function RankBadge({ tier, size = 28, showLabel = false }: { tier: RankTier; size?: number; showLabel?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <path d={HEX_FRAME} fill={tier.color} stroke="color-mix(in srgb, black 25%, transparent)" strokeWidth="1.5" />
        <path d={HEX_FRAME} fill="none" stroke="color-mix(in srgb, white 35%, transparent)" strokeWidth="1" transform="scale(0.92) translate(2.8, 2.8)" />
        <Glyph tierId={tier.id} glyphColor="var(--nm-bg)" />
      </svg>
      {showLabel && <span style={{ fontSize: 13, fontWeight: 700, color: tier.color }}>{tier.label}</span>}
    </div>
  );
}
