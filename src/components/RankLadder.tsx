import RankBadge from './RankBadge';
import { RANK_TIERS, rankForLevel } from '../lib/rankTiers';

/**
 * A compact view of the FULL 10-tier rank ladder (see lib/rankTiers.ts),
 * with the learner's current tier visually highlighted -- reuses the same
 * RANK_TIERS data and RankBadge component ProfilePage's own single-tier
 * "Rank" card already uses, rather than a second, parallel rank
 * rendering. Where ProfilePage shows only the CURRENT tier (plus "N
 * levels to <next>"), this shows every tier at once so a learner can see
 * the whole ladder and where they sit on it -- real, at-a-glance context
 * ProfilePage deliberately doesn't need (its "N levels to next" line
 * already answers "what's next"), which is why this lives on /progress
 * instead of duplicating ProfilePage's own rank card.
 */
export default function RankLadder({ level }: { level: number }) {
  const current = rankForLevel(level);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        padding: '1.1rem 1.25rem',
        borderRadius: 12,
        border: '1px solid var(--nm-border)',
        background: 'var(--nm-surface)',
      }}
    >
      {RANK_TIERS.map((tier) => {
        const isCurrent = tier.id === current.id;
        const reached = level >= tier.minLevel;
        return (
          <div
            key={tier.id}
            title={`${tier.label} -- unlocks at level ${tier.minLevel}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flex: '1 1 80px',
              minWidth: 80,
              padding: '0.6rem 0.4rem',
              borderRadius: 10,
              border: isCurrent ? `1.5px solid ${tier.color}` : '1px solid var(--nm-border)',
              background: isCurrent ? `color-mix(in srgb, ${tier.color} 14%, var(--nm-surface))` : 'transparent',
              opacity: reached ? 1 : 0.55,
            }}
          >
            <RankBadge tier={tier} size={isCurrent ? 40 : 32} />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: isCurrent ? 800 : 600,
                color: isCurrent ? tier.color : 'var(--nm-text-secondary)',
                textAlign: 'center',
              }}
            >
              {tier.label}
            </span>
            <span style={{ fontSize: 10, color: 'var(--nm-text-muted)' }}>Lvl {tier.minLevel}+</span>
            {isCurrent && (
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: tier.color,
                }}
              >
                You
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
