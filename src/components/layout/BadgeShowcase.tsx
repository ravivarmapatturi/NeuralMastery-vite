import { useGamification } from '../../contexts/GamificationContext';
import { BADGES } from '../../lib/badges';
import { computeRLValuation } from '../../lib/gamification';
import { useVizTokens } from '../../theme/vizTokens';

export default function BadgeShowcase() {
  const t = useVizTokens();
  const { events, totalXP, streak, activeDates } = useGamification();

  // Compute breakdown stats for badge unlocks
  const pagesUnderstood = events.filter((e) => e.kind === 'mark').length;
  const problemsSolved = events.filter((e) => e.kind === 'complete').length;
  const systemDesignSolved = events.filter((e) => e.kind === 'design').length;

  const stats = {
    totalXP,
    streak,
    pagesUnderstood,
    problemsSolved,
    systemDesignSolved,
  };

  const unlockedCount = BADGES.filter((b) => b.checkUnlocked(stats)).length;

  // Sample RL valuation for solving a medium problem
  const rlValuation = computeRLValuation('complete', 'medium', events, activeDates);

  return (
    <div
      style={{
        background: 'var(--nm-surface, #1e293b)',
        borderRadius: 16,
        padding: 24,
        border: '1px solid var(--nm-border, rgba(255,255,255,0.1))',
        margin: '24px 0',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--nm-text-heading, #f8fafc)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏆</span> Checkpoint Badges & Milestones
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--nm-text-muted, #94a3b8)' }}>
            Unlocked {unlockedCount} of {BADGES.length} checkpoint badges
          </p>
        </div>

        {/* Progress pill */}
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#818cf8',
          }}
        >
          {Math.round((unlockedCount / BADGES.length) * 100)}% Completed
        </div>
      </div>

      {/* RL Reward Engine Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', tracking: '0.05em', color: '#818cf8', fontWeight: 600 }}>
            RL Reward Model G_t
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f3f4f6', marginTop: 4 }}>
            {rlValuation.discountedReturn} <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>G_t</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            Short-term ({rlValuation.immediateReward} XP) + Long-term ({rlValuation.futureValue} V)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', tracking: '0.05em', color: '#a855f7', fontWeight: 600 }}>
            Discount Factor (γ)
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f3f4f6', marginTop: 4 }}>
            {rlValuation.gamma}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            Balances immediate dopamine vs milestone horizon
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', tracking: '0.05em', color: '#10b981', fontWeight: 600 }}>
            Streak Multiplier
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f3f4f6', marginTop: 4 }}>
            {rlValuation.streakBonus}x
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
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
        {BADGES.map((badge) => {
          const unlocked = badge.checkUnlocked(stats);

          return (
            <div
              key={badge.id}
              style={{
                background: unlocked ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.4)',
                border: unlocked ? '1px solid rgba(99, 102, 241, 0.4)' : '1px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                opacity: unlocked ? 1 : 0.65,
                transition: 'all 0.2s ease',
                boxShadow: unlocked ? '0 4px 20px -2px rgba(99, 102, 241, 0.15)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  filter: unlocked ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' : 'grayscale(1)',
                }}
              >
                {badge.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: unlocked ? 'var(--nm-text-heading, #f8fafc)' : 'var(--nm-text-muted, #94a3b8)' }}>
                    {badge.title}
                  </div>
                  {unlocked ? (
                    <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      UNLOCKED
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, background: 'rgba(255, 255, 255, 0.05)', color: '#6b7280', padding: '2px 6px', borderRadius: 4 }}>
                      LOCKED
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 12, color: 'var(--nm-text-muted, #94a3b8)', marginTop: 4, lineHeight: 1.4 }}>
                  {badge.description}
                </div>

                <div style={{ fontSize: 11, color: t.accentTeal, marginTop: 6, fontWeight: 500 }}>
                  {badge.requirementText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
