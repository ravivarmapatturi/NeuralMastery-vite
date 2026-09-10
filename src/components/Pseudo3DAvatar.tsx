import React, { useState, useRef, useCallback } from 'react';
import type { RankTier } from '../lib/rankTiers';

export interface Pseudo3DAvatarProps {
  tier: RankTier;
  size?: number;
  className?: string;
}

/**
 * Layered pseudo-3D cybernetic neural avatar.
 * Renders multiple stacked visual planes with true CSS 3D perspective,
 * rank-tinted glow/aura, multi-layer drop shadows, interactive mouse parallax,
 * and a subtle float/breathe idle animation.
 * Fully honors prefers-reduced-motion.
 */
export default function Pseudo3DAvatar({ tier, size = 150, className }: Pseudo3DAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 2, y: y * 2 }); // -1 to 1
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  // Calculate transforms
  const rotateX = tilt.y * -14;
  const rotateY = tilt.x * 16;
  const rankColor = tier.color;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`nm-pseudo-3d-avatar ${className ?? ''}`}
      data-testid="pseudo-3d-avatar"
      data-tier={tier.id}
      style={{
        width: size,
        height: size,
        position: 'relative',
        perspective: 900,
        transformStyle: 'preserve-3d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'crosshair',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes nm-avatar-idle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes nm-avatar-aura-breathe {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }
        }
        @keyframes nm-avatar-ring-spin {
          0% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }

        .nm-avatar-float-wrap {
          animation: nm-avatar-idle-float 4.5s ease-in-out infinite;
        }
        .nm-avatar-aura-pulse {
          animation: nm-avatar-aura-breathe 4s ease-in-out infinite;
        }
        .nm-avatar-orbit-spin {
          animation: nm-avatar-ring-spin 24s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nm-pseudo-3d-avatar,
          .nm-pseudo-3d-avatar *,
          .nm-avatar-float-wrap,
          .nm-avatar-aura-pulse,
          .nm-avatar-orbit-spin {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Tilt Container */}
      <div
        className="nm-avatar-float-wrap"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
        }}
      >
        {/* --- LAYER 0: Ambient Aura / Glow --- */}
        <div
          className="nm-avatar-aura-pulse"
          style={{
            position: 'absolute',
            inset: -14,
            borderRadius: '50%',
            background: `radial-gradient(circle at center, color-mix(in srgb, ${rankColor} 50%, transparent) 0%, color-mix(in srgb, ${rankColor} 20%, transparent) 45%, transparent 70%)`,
            filter: 'blur(16px)',
            transform: 'translateZ(-30px)',
            pointerEvents: 'none',
          }}
        />

        {/* --- LAYER 1: Geometric Orbital Frame / Depth Rings --- */}
        <div
          className="nm-avatar-orbit-spin"
          style={{
            position: 'absolute',
            inset: 4,
            transform: `translateZ(-10px) translate(${tilt.x * -4}px, ${tilt.y * -4}px)`,
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 160 160" width="100%" height="100%" fill="none">
            <circle
              cx="80"
              cy="80"
              r="74"
              stroke={rankColor}
              strokeWidth="1.2"
              strokeDasharray="6 8"
              strokeOpacity="0.4"
            />
            <polygon
              points="80,10 142,46 142,114 80,150 18,114 18,46"
              stroke={rankColor}
              strokeWidth="1.5"
              strokeOpacity="0.25"
              fill="none"
            />
            {/* Cardinal tech ticks */}
            <line x1="80" y1="4" x2="80" y2="12" stroke={rankColor} strokeWidth="2" strokeOpacity="0.7" />
            <line x1="80" y1="148" x2="80" y2="156" stroke={rankColor} strokeWidth="2" strokeOpacity="0.7" />
            <line x1="4" y1="80" x2="12" y2="80" stroke={rankColor} strokeWidth="2" strokeOpacity="0.7" />
            <line x1="148" y1="80" x2="156" y2="80" stroke={rankColor} strokeWidth="2" strokeOpacity="0.7" />
          </svg>
        </div>

        {/* --- LAYER 2: Back Mantle & Cybernetic Armor (Silhouette base) --- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateZ(10px) translate(${tilt.x * 3}px, ${tilt.y * 3}px)`,
            filter: 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.6))',
          }}
        >
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <defs>
              <linearGradient id={`nm-torso-grad-${tier.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id={`nm-pauldron-grad-${tier.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Shoulders / Pauldrons */}
            <path
              d="M 28 128 L 52 98 L 80 108 L 108 98 L 132 128 L 118 148 L 42 148 Z"
              fill={`url(#nm-torso-grad-${tier.id})`}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1.2"
            />
            {/* Left Pauldron facet */}
            <path
              d="M 28 128 L 52 98 L 58 116 L 36 140 Z"
              fill={`url(#nm-pauldron-grad-${tier.id})`}
              stroke="rgba(255, 255, 255, 0.08)"
            />
            {/* Right Pauldron facet */}
            <path
              d="M 132 128 L 108 98 L 102 116 L 124 140 Z"
              fill={`url(#nm-pauldron-grad-${tier.id})`}
              stroke="rgba(255, 255, 255, 0.08)"
            />
            {/* Torso Center Plate */}
            <path
              d="M 68 112 L 80 108 L 92 112 L 88 142 L 72 142 Z"
              fill="#090d16"
              stroke={rankColor}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        </div>

        {/* --- LAYER 3: Faceted Cybernetic Head & Helmet Visor --- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateZ(28px) translate(${tilt.x * 7}px, ${tilt.y * 7}px)`,
            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5))',
          }}
        >
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <defs>
              <linearGradient id={`nm-helm-grad-${tier.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id={`nm-visor-grad-${tier.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={rankColor} stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor={rankColor} stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Helmet base contour */}
            <polygon
              points="80,26 108,44 112,74 98,96 80,104 62,96 48,74 52,44"
              fill={`url(#nm-helm-grad-${tier.id})`}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.2"
            />

            {/* Left face facet */}
            <polygon
              points="80,26 52,44 48,74 62,96 80,104 80,26"
              fill="rgba(0, 0, 0, 0.22)"
            />

            {/* Jaw / Chin guard plate */}
            <polygon
              points="68,88 80,84 92,88 88,102 80,106 72,102"
              fill="#090d16"
              stroke={rankColor}
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />

            {/* Visor Bar (Glowing Emissive slit) */}
            <polygon
              points="58,62 80,66 102,62 98,72 80,75 62,72"
              fill={`url(#nm-visor-grad-${tier.id})`}
              filter="drop-shadow(0 0 6px currentColor)"
              color={rankColor}
            />
          </svg>
        </div>

        {/* --- LAYER 4: Neural Forehead Core & Circuit Nodes (Forefront) --- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateZ(44px) translate(${tilt.x * 12}px, ${tilt.y * 12}px)`,
            filter: `drop-shadow(0 0 8px ${rankColor})`,
          }}
        >
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            {/* Forehead Neural Core Diamond */}
            <polygon
              points="80,36 86,43 80,50 74,43"
              fill="#ffffff"
              stroke={rankColor}
              strokeWidth="1.5"
            />

            {/* Neural Crest antenna lines */}
            <line x1="80" y1="36" x2="80" y2="24" stroke={rankColor} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="74" y1="43" x2="64" y2="40" stroke={rankColor} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="86" y1="43" x2="96" y2="40" stroke={rankColor} strokeWidth="1.2" strokeLinecap="round" />

            {/* Glowing nodes on forehead */}
            <circle cx="64" cy="40" r="1.8" fill="#ffffff" />
            <circle cx="96" cy="40" r="1.8" fill="#ffffff" />
            <circle cx="80" cy="24" r="2" fill={rankColor} />

            {/* Chest reactor core */}
            <circle cx="80" cy="124" r="4.5" fill="#090d16" stroke={rankColor} strokeWidth="1.5" />
            <circle cx="80" cy="124" r="2.2" fill="#ffffff" />
          </svg>
        </div>
      </div>
    </div>
  );
}
