import { NavLink, useLocation } from 'react-router-dom';
import { getSidebar } from '../../lib/contentTree';

/**
 * Renders the same generated content-tree data (getSidebar()) for both the
 * permanently-docked desktop rail and the mobile drawer -- variant only
 * changes chrome (fixed width/border vs. full-width-in-drawer), never the
 * underlying navigation structure, per the "one source of truth" rule.
 */
export default function Sidebar({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const sections = getSidebar();
  const location = useLocation();
  const isMobile = variant === 'mobile';

  return (
    <nav
      className={isMobile ? undefined : 'nm-sidebar'}
      aria-label="Documentation sections"
      style={
        isMobile
          ? { width: '100%', padding: 0 }
          : { width: 260, flexShrink: 0, padding: '1.5rem 1rem', borderRight: '1px solid var(--nm-border)' }
      }
    >
      {sections.map((section) => {
        const sectionActive = section.pages.some((p) => p.route === location.pathname);
        return (
          <div key={section.id} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: sectionActive ? 'var(--nm-accent-primary)' : 'var(--nm-text-muted)',
                marginBottom: 6,
              }}
            >
              {section.label}
            </div>
            {section.pages.map((page) => (
              <NavLink
                key={page.route}
                to={page.route}
                onClick={onNavigate}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '6px 0',
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
        );
      })}
    </nav>
  );
}
