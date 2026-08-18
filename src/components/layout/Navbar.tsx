import { Link } from 'react-router-dom';
import { useColorMode } from '../../theme/ThemeProvider';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'var(--nm-surface)',
        borderBottom: '1px solid var(--nm-border)',
      }}
    >
      <Link to="/" style={{ fontWeight: 700, fontSize: 17, color: 'var(--nm-text-primary)', textDecoration: 'none' }}>
        Neural Mastery
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/docs/getting-started/intro" style={{ color: 'var(--nm-text-primary)', textDecoration: 'none', fontSize: 14 }}>
          Learn
        </Link>
        <button
          type="button"
          onClick={toggleColorMode}
          aria-label="Toggle color mode"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid var(--nm-border)',
            background: 'transparent',
            color: 'var(--nm-text-primary)',
            cursor: 'pointer',
          }}
        >
          {colorMode === 'dark' ? '☀' : '☾'}
        </button>
      </nav>
    </header>
  );
}
