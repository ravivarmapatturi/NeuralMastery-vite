import type { CSSProperties } from 'react';

interface IconProps {
  color?: string;
  size?: number;
  style?: CSSProperties;
  className?: string;
}

const SW = 1.75;
const commonProps = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function CheckIcon({ color = 'currentColor', size = 16, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function ClockIcon({ color = 'currentColor', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={SW} {...commonProps} />
      <polyline points="12 7 12 12 15 14" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function SparkleIcon({ color = 'currentColor', size = 16, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <path
        d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z"
        stroke={color}
        strokeWidth={SW}
        {...commonProps}
      />
    </svg>
  );
}

export function LightbulbIcon({ color = 'currentColor', size = 16, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <path
        d="M9 18h6m-4 3h2m-7-11a6 6 0 1 1 12 0c0 2.22-1.21 4.16-3 5.2V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.8C7.21 14.16 6 12.22 6 10z"
        stroke={color}
        strokeWidth={SW}
        {...commonProps}
      />
    </svg>
  );
}

export function BookOpenIcon({ color = 'currentColor', size = 16, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke={color} strokeWidth={SW} {...commonProps} />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function CodeIcon({ color = 'currentColor', size = 16, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polyline points="16 18 22 12 16 6" stroke={color} strokeWidth={SW} {...commonProps} />
      <polyline points="8 6 2 12 8 18" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function TerminalIcon({ color = 'currentColor', size = 16, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polyline points="4 17 10 11 4 5" stroke={color} strokeWidth={SW} {...commonProps} />
      <line x1="12" y1="19" x2="20" y2="19" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function ZapIcon({ color = 'currentColor', size = 15, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function ArrowRightIcon({ color = 'currentColor', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={SW} {...commonProps} />
      <polyline points="12 5 19 12 12 19" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function PlayIcon({ color = 'currentColor', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" fill={color} stroke="none" />
    </svg>
  );
}

export function RotateCcwIcon({ color = 'currentColor', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polyline points="1 4 1 10 7 10" stroke={color} strokeWidth={SW} {...commonProps} />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

export function InfoIcon({ color = 'currentColor', size = 15, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={SW} {...commonProps} />
      <line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth={SW} {...commonProps} />
      <circle cx="12" cy="8" r="0.75" fill={color} stroke="none" />
    </svg>
  );
}

export function AlertTriangleIcon({ color = 'currentColor', size = 15, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth={SW} {...commonProps} />
      <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={SW} {...commonProps} />
      <circle cx="12" cy="17" r="0.75" fill={color} stroke="none" />
    </svg>
  );
}

export function CloseIcon({ color = 'currentColor', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={SW} {...commonProps} />
      <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}

/** Gold mastery badge: solved independently without viewing hints */
export function GoldMasteryIcon({ color = 'var(--nm-accent-warn, #eab308)', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={color}
        stroke={color}
        strokeWidth={1}
        {...commonProps}
      />
    </svg>
  );
}

/** Bronze mastery badge: solved with hint assistance */
export function BronzeMasteryIcon({ color = '#b45309', size = 14, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={SW} {...commonProps} />
      <polyline points="16 10 11 15 8 12" stroke={color} strokeWidth={SW} {...commonProps} />
    </svg>
  );
}
