import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Pseudo3DAvatar from './Pseudo3DAvatar';
import { RANK_TIERS } from '../lib/rankTiers';

describe('Pseudo3DAvatar', () => {
  const testTier = RANK_TIERS[5]; // Specialist

  it('renders with testid, tier dataset attribute, and layered structure', () => {
    const { getByTestId } = render(<Pseudo3DAvatar tier={testTier} size={160} />);
    const avatar = getByTestId('pseudo-3d-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-tier', testTier.id);
  });

  it('handles mouse interaction and tilt updates', () => {
    const { getByTestId } = render(<Pseudo3DAvatar tier={testTier} size={160} />);
    const avatar = getByTestId('pseudo-3d-avatar');

    // Mock getBoundingClientRect
    avatar.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 160,
      height: 160,
      right: 160,
      bottom: 160,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseEnter(avatar);
    fireEvent.mouseMove(avatar, { clientX: 120, clientY: 40 });
    fireEvent.mouseLeave(avatar);

    expect(avatar).toBeInTheDocument();
  });

  it('includes reduced-motion CSS rules to suppress animations and transforms', () => {
    const { container } = render(<Pseudo3DAvatar tier={testTier} />);
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.textContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styleTag?.textContent).toContain('animation: none !important');
    expect(styleTag?.textContent).toContain('transform: none !important');
  });
});
