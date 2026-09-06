import { Link } from 'react-router-dom';

/**
 * Real, basic site-legitimacy infrastructure -- copyright, and links to
 * the actual Privacy Policy / Terms / About pages, plus the real public
 * GitHub repo (no fabricated contact form/email -- see About page for
 * why GitHub is the real, honest contact channel this project actually
 * has). Mounted once in App.tsx alongside <Routes>, not per-page, so it
 * appears on every route without each page component needing to render
 * it itself.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: '1px solid var(--nm-border)',
        padding: '1.5rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem 1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: 'var(--nm-text-muted)',
        }}
      >
        <span>© {year} Neural Mastery</span>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }} aria-label="Footer">
          <Link to="/about" style={{ color: 'inherit' }}>
            About
          </Link>
          <Link to="/privacy" style={{ color: 'inherit' }}>
            Privacy Policy
          </Link>
          <Link to="/terms" style={{ color: 'inherit' }}>
            Terms of Service
          </Link>
          <a href="https://github.com/ravivarmapatturi/NeuralMastery-vite" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
