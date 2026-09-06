import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { useLeaderboard, type LeaderboardEntry } from '../lib/useLeaderboard';
import { levelForPoints, computeDisplayName } from '../lib/gamification';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function LeaderboardPage() {
  useDocumentTitle('Leaderboard');
  useDocumentMeta(
    'Leaderboard',
    'Global Neural Mastery Leaderboard -- see how your AI engineering points, level, and problem-solving streak stack up against learners worldwide.',
  );

  const { user, signInWithGoogle } = useAuth();
  const { points, weeklyPoints } = useGamification();
  const [tab, setTab] = useState<'allTime' | 'weekly'>('allTime');
  const { entries: remoteEntries, loading } = useLeaderboard(tab, 50);

  const userDisplayName = computeDisplayName(user);
  const currentPoints = tab === 'allTime' ? points : weeklyPoints;
  const userUid = user?.uid ?? 'local-visitor';

  // Combine remote entries with current user's local entry if missing
  let entries = [...remoteEntries];
  const userInEntries = entries.some((e) => e.uid === userUid || (user && e.displayName === userDisplayName));

  if (!userInEntries && currentPoints > 0) {
    entries.push({
      uid: userUid,
      displayName: userDisplayName,
      points: currentPoints,
    });
    entries.sort((a, b) => b.points - a.points);
  }

  const userRankIndex = entries.findIndex((e) => e.uid === userUid || (user && e.displayName === userDisplayName));
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  const top3 = entries.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-bg, #090d16)', color: 'var(--nm-text-primary, #f8fafc)' }}>
      <Navbar />

      <main style={{ maxWidth: 1350, margin: '0 auto', padding: '2.5rem 2rem 3rem' }}>
        {/* --- Hero Header --- */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: 12,
            }}
          >
            🏆 Global Rankings
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            AI Engineering Leaderboard
          </h1>
          <p style={{ fontSize: 15, color: 'var(--nm-text-muted, #94a3b8)', maxWidth: 600, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Track your progress against builders mastering deep learning, LLM architecture, and core AI systems.
          </p>

          {/* Timeframe Toggle Tabs */}
          <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.8)', padding: 4, borderRadius: 10, border: '1px solid var(--nm-border)' }}>
            <button
              type="button"
              onClick={() => setTab('allTime')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                background: tab === 'allTime' ? 'var(--nm-accent-primary, #6366f1)' : 'transparent',
                color: tab === 'allTime' ? '#fff' : 'var(--nm-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🌐 All-Time
            </button>
            <button
              type="button"
              onClick={() => setTab('weekly')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                background: tab === 'weekly' ? 'var(--nm-accent-primary, #6366f1)' : 'transparent',
                color: tab === 'weekly' ? '#fff' : 'var(--nm-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ⚡ This Week
            </button>
          </div>
        </div>

        {/* --- Guest / Sign-in Banner --- */}
        {!user && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Want your name on the leaderboard?</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--nm-text-muted)' }}>
                Sign in with Google to sync your points across devices and claim your public rank.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                background: 'var(--nm-accent-primary, #6366f1)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Sign In with Google →
            </button>
          </div>
        )}

        {/* --- Current User Stats Bar --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: '2rem',
          }}
        >
          <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'var(--nm-surface)', border: '1px solid var(--nm-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>Your Current Rank</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: userRank ? '#38bdf8' : 'var(--nm-text-muted)' }}>
              {userRank ? `#${userRank}` : 'Unranked'}
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'var(--nm-surface)', border: '1px solid var(--nm-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>
              Your {tab === 'allTime' ? 'Total XP' : 'Weekly XP'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--nm-accent-primary, #818cf8)' }}>
              {currentPoints} <span style={{ fontSize: 13, fontWeight: 600 }}>pts</span>
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'var(--nm-surface)', border: '1px solid var(--nm-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--nm-text-muted)', marginBottom: 4 }}>Your Level</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>
              Level {levelForPoints(points).level}
            </div>
          </div>
        </div>

        {/* --- Top 3 Podium --- */}
        {top3.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: top3.length === 3 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
              marginBottom: '2.5rem',
              alignItems: 'end',
            }}
          >
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <PodiumCard
                entry={top3[1]}
                rank={2}
                medal="🥈"
                color="#e2e8f0"
                borderColor="rgba(226, 232, 240, 0.4)"
                isSelf={top3[1].uid === userUid}
              />
            )}
            {/* Rank 1 (Gold) */}
            {top3[0] && (
              <PodiumCard
                entry={top3[0]}
                rank={1}
                medal="🥇"
                color="#fbbf24"
                borderColor="rgba(251, 191, 36, 0.5)"
                isSelf={top3[0].uid === userUid}
                isFirst
              />
            )}
            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <PodiumCard
                entry={top3[2]}
                rank={3}
                medal="🥉"
                color="#f97316"
                borderColor="rgba(249, 115, 22, 0.4)"
                isSelf={top3[2].uid === userUid}
              />
            )}
          </div>
        )}

        {/* --- Main Leaderboard Table --- */}
        <div
          style={{
            borderRadius: 14,
            border: '1px solid var(--nm-border)',
            background: 'var(--nm-surface)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--nm-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.6)',
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--nm-text-primary)' }}>Full Standings</h2>
            <Link to="/profile" style={{ fontSize: 13, color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
              View Profile →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--nm-text-muted)' }}>
              Loading leaderboard rankings…
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--nm-text-muted)' }}>
              No points on the leaderboard yet. Solve a practice problem to claim #1!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isSelf = entry.uid === userUid || (user && entry.displayName === userDisplayName);

                return (
                  <div
                    key={entry.uid || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '0.85rem 1.5rem',
                      borderBottom: idx === entries.length - 1 ? 'none' : '1px solid var(--nm-border)',
                      background: isSelf ? 'color-mix(in srgb, var(--nm-accent-primary) 12%, transparent)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Rank Badge */}
                    <div
                      style={{
                        width: 32,
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: 900,
                        color: rank === 1 ? '#fbbf24' : rank === 2 ? '#cbd5e1' : rank === 3 ? '#f97316' : 'var(--nm-text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: isSelf ? 'var(--nm-accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                          color: isSelf ? '#fff' : 'var(--nm-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {entry.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontWeight: isSelf ? 800 : 600,
                          fontSize: 14,
                          color: isSelf ? '#818cf8' : 'var(--nm-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.displayName}
                      </span>
                      {isSelf && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>

                    {/* Points */}
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--nm-accent-primary, #818cf8)', flexShrink: 0 }}>
                      {entry.points} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--nm-text-muted)' }}>pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: number;
  medal: string;
  color: string;
  borderColor: string;
  isSelf: boolean;
  isFirst?: boolean;
}

function PodiumCard({ entry, medal, color, borderColor, isSelf, isFirst }: PodiumCardProps) {
  return (
    <div
      style={{
        padding: isFirst ? '1.5rem 1.25rem' : '1.25rem 1rem',
        borderRadius: 14,
        background: isFirst ? 'linear-gradient(180deg, rgba(251, 191, 36, 0.12) 0%, var(--nm-surface) 100%)' : 'var(--nm-surface)',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
        boxShadow: isFirst ? '0 10px 30px rgba(251, 191, 36, 0.15)' : 'none',
      }}
    >
      <div style={{ fontSize: isFirst ? 28 : 22, marginBottom: 6 }}>{medal}</div>
      <div
        style={{
          width: isFirst ? 48 : 40,
          height: isFirst ? 48 : 40,
          borderRadius: '50%',
          margin: '0 auto 8px',
          background: color,
          color: '#090d16',
          fontWeight: 900,
          fontSize: isFirst ? 18 : 15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {entry.displayName.charAt(0).toUpperCase()}
      </div>
      <div
        style={{
          fontWeight: 800,
          fontSize: isFirst ? 15 : 13.5,
          color: 'var(--nm-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.displayName} {isSelf && '(You)'}
      </div>
      <div style={{ fontSize: isFirst ? 16 : 14, fontWeight: 900, color, marginTop: 4 }}>
        {entry.points} pts
      </div>
    </div>
  );
}
