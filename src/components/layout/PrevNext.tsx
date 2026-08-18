import React from 'react';
import { Link } from 'react-router-dom';
import { getPrevNext } from '../../lib/contentTree';

export default function PrevNext({ route }: { route: string }) {
  const { prev, next } = getPrevNext(route);
  if (!prev && !next) return null;

  const linkStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid var(--nm-border)',
    borderRadius: 10,
    textDecoration: 'none',
    color: 'var(--nm-text-primary)',
    fontSize: 14,
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
      {prev ? (
        <Link to={prev.route} style={linkStyle}>
          <div style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>← Previous</div>
          <div style={{ fontWeight: 600 }}>{prev.title}</div>
        </Link>
      ) : (
        <div style={{ flex: 1 }} />
      )}
      {next ? (
        <Link to={next.route} style={{ ...linkStyle, textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--nm-text-muted)' }}>Next →</div>
          <div style={{ fontWeight: 600 }}>{next.title}</div>
        </Link>
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  );
}
