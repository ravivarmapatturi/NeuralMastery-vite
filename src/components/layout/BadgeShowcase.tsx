import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { BADGES } from '../../lib/badges';
import { computeRLValuation } from '../../lib/gamification';
import { useVizTokens } from '../../theme/vizTokens';

export default function BadgeShowcase() {
  const t = useVizTokens();
  const { events, points: totalXP, streak } = useGamification();
  const activeDates = events.map((e) => e.date);

  // Compute breakdown stats for badge unlocks
  const pagesUnderstood = events.filter((e) => e.kind === 'mark').length;
  const problemsSolved = events.filter((e) => e.kind === 'complete').length;
  const systemDesignSolved = events.filter((e) => e.kind === 'design').length;

  const { user } = useAuth();
  const isSignedIn = Boolean(user);
  const stats = {
    totalXP,
    streak,
    pagesUnderstood,
    problemsSolved,
    systemDesignSolved,
    isSignedIn,
  };

  const unlockedBadges = BADGES.filter((b) => b.checkUnlocked(stats));
  const unlockedCount = unlockedBadges.length;

  // Sample RL valuation for solving a medium problem
  const rlValuation = computeRLValuation('complete', 'medium', events, activeDates);


  return (
    <div
      style={{
        background: 'var(--nm-surface)',
        borderRadius: 16,
        padding: 24,
        border: '1px solid var(--nm-border)',
        margin: '24px 0',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          {/* Real bug this fixes: --nm-text-heading was never a real
             defined CSS variable anywhere in the theme -- it always fell
             through to the hardcoded #f8fafc fallback, which is a
             near-white color correct only in dark mode. Using the real
             --nm-text-primary token here (as every other component in
             the codebase does) is what actually makes this switch with
             the real theme. */}
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--nm-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏆</span> Checkpoint Badges & Milestones
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--nm-text-muted)' }}>
            Unlocked {unlockedCount} of {BADGES.length} checkpoint badges
          </p>
        </div>

        {/* Progress pill */}
        <div
          style={{
            background: 'color-mix(in srgb, var(--nm-accent-secondary) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--nm-accent-secondary) 30%, transparent)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--nm-accent-secondary)',
          }}
        >
          {Math.round((unlockedCount / BADGES.length) * 100)}% Completed
        </div>
      </div>

      {/* RL Reward Engine Banner */}
      <div
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--nm-accent-secondary) 10%, transparent) 0%, color-mix(in srgb, var(--nm-accent-purple) 10%, transparent) 100%)',
          border: '1px solid color-mix(in srgb, var(--nm-accent-secondary) 25%, transparent)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nm-accent-secondary)', fontWeight: 600 }}>
            RL Reward Model G_t
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)', marginTop: 4 }}>
            {rlValuation.discountedReturn} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--nm-text-secondary)' }}>G_t</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--nm-text-secondary)', marginTop: 2 }}>
            Short-term ({rlValuation.immediateReward} XP) + Long-term ({rlValuation.futureValue} V)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nm-accent-purple)', fontWeight: 600 }}>
            Discount Factor (γ)
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)', marginTop: 4 }}>
            {rlValuation.gamma}
          </div>
          <div style={{ fontSize: 12, color: 'var(--nm-text-secondary)', marginTop: 2 }}>
            Balances immediate dopamine vs milestone horizon
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nm-accent-primary)', fontWeight: 600 }}>
            Streak Multiplier
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nm-text-primary)', marginTop: 4 }}>
            {rlValuation.streakBonus}x
          </div>
          <div style={{ fontSize: 12, color: 'var(--nm-text-secondary)', marginTop: 2 }}>
            {streak > 0 ? `${streak}-day active streak bonus` : 'Complete daily tasks to boost'}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {unlockedBadges.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--nm-text-muted)',
              fontSize: 14,
            }}
          >
            No checkpoint badges earned yet. Mark lessons understood, maintain your streak, and solve practice problems to unlock badges!
          </div>
        ) : (
          unlockedBadges.map((badge) => (
            <div
              key={badge.id}
              style={{
                background: 'color-mix(in srgb, var(--nm-accent-secondary) 8%, var(--nm-surface-alt))',
                border: '1px solid color-mix(in srgb, var(--nm-accent-secondary) 40%, transparent)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                opacity: 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px -2px color-mix(in srgb, var(--nm-accent-secondary) 15%, transparent)',
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))',
                }}
              >
                {badge.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--nm-text-primary)' }}>
                    {badge.title}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      background: 'color-mix(in srgb, var(--nm-accent-primary) 20%, transparent)',
                      color: 'var(--nm-accent-primary)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    UNLOCKED
                  </span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                  {badge.description}
                </div>

                <div style={{ fontSize: 11, color: t.accentTeal, marginTop: 6, fontWeight: 500 }}>
                  {badge.requirementText}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
