import { useEffect, useState, useRef } from 'react';
import { useColorMode } from '../theme/ThemeProvider';

const STORAGE_KEY = 'neural-mastery-page-theme';

interface Skin {
  id: string;
  name: string;
  swatch: string;
  border?: string;
}

const SKINS: Skin[] = [
  { id: 'default', name: 'White', swatch: '#ffffff', border: '#d7dade' },
  { id: 'sepia', name: 'Sepia', swatch: '#f6eedd' },
  { id: 'rose', name: 'Rosé', swatch: '#fbeef3' },
  { id: 'sage', name: 'Sage', swatch: '#ebf4ec' },
  { id: 'lavender', name: 'Lavender', swatch: '#f1ecfa' },
  { id: 'sky', name: 'Sky', swatch: '#eaf2fb' },
];

function applySkin(id: string) {
  if (id && id !== 'default') {
    document.documentElement.setAttribute('data-page-theme', id);
  } else {
    document.documentElement.removeAttribute('data-page-theme');
  }
}

// Opt-in, study-friendly background skins -- alternatives to plain white.
// Always visible regardless of the current color mode: it's the control for
// "what should the light-mode background look like," and using it commits
// to light mode (via setColorMode) so the choice is immediately visible,
// even if the reader's OS/browser prefers dark.
export default function ThemeSkinPicker() {
  const { setColorMode } = useColorMode();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('default');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) || 'default';
    setActive(saved);
    applySkin(saved);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function choose(id: string) {
    setActive(id);
    applySkin(id);
    setColorMode('light');
    window.localStorage.setItem(STORAGE_KEY, id);
    setOpen(false);
  }

  const activeSkin = SKINS.find((s) => s.id === active) || SKINS[0];

  return (
    <div ref={ref} style={{ position: 'fixed', right: '1.25rem', bottom: '1.25rem', zIndex: 200 }}>
      {open && (
        <div
          role="menu"
          aria-label="Page background theme"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 0.5rem)',
            right: 0,
            background: 'var(--nm-surface)',
            border: '1px solid var(--nm-border)',
            borderRadius: '10px',
            padding: '0.5rem',
            boxShadow: '0 8px 24px rgba(20,22,26,0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            minWidth: '140px',
          }}
        >
          {SKINS.map((s) => (
            <button
              key={s.id}
              role="menuitemradio"
              aria-checked={active === s.id}
              onClick={() => choose(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: active === s.id ? 'var(--nm-surface-alt)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.5rem',
                cursor: 'pointer',
                font: 'inherit',
                fontSize: '0.82rem',
                color: 'var(--nm-text-primary)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: s.swatch,
                  border: `1px solid ${s.border || 'rgba(20,22,26,0.15)'}`,
                  flexShrink: 0,
                }}
              />
              {s.name}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change page background color"
        aria-expanded={open}
        title="Page background color"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '1px solid var(--nm-border)',
          background: activeSkin.swatch,
          boxShadow: '0 2px 10px rgba(20,22,26,0.18)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: `1.5px solid ${activeSkin.border || 'rgba(20,22,26,0.35)'}`,
          }}
        />
      </button>
    </div>
  );
}
