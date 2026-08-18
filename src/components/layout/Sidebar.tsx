import { NavLink } from 'react-router-dom';
import { getSidebar } from '../../lib/contentTree';

export default function Sidebar() {
  const sections = getSidebar();
  return (
    <nav className="nm-sidebar" style={{ width: 260, flexShrink: 0, padding: '1.5rem 1rem', borderRight: '1px solid var(--nm-border)' }}>
      {sections.map((section) => (
        <div key={section.id} style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--nm-text-muted)',
              marginBottom: 6,
            }}
          >
            {section.label}
          </div>
          {section.pages.map((page) => (
            <NavLink
              key={page.route}
              to={page.route}
              style={({ isActive }) => ({
                display: 'block',
                padding: '4px 0',
                fontSize: 14,
                textDecoration: 'none',
                color: isActive ? 'var(--nm-accent-primary)' : 'var(--nm-text-secondary)',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {page.title}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
