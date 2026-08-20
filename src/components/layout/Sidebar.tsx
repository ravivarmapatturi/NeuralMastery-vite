import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getSidebar } from '../../lib/contentTree';

const EXPANDED_KEY = 'neural-mastery-sidebar-expanded-sections';

function readExpanded(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(EXPANDED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Renders the same generated content-tree data (getSidebar()) for both the
 * permanently-docked desktop rail and the mobile drawer -- variant only
 * changes chrome (fixed width/border vs. full-width-in-drawer), never the
 * underlying navigation structure, per the "one source of truth" rule.
 *
 * Sections collapse/expand individually (persisted in localStorage, same
 * pattern as DocLayout's sidebar/TOC collapse) -- with ~30 sections and
 * 209 pages total, rendering everything expanded at once both buries the
 * active section in a huge flat list and, via flexbox's default
 * align-items: stretch on .nm-doc-row, forces every other column
 * (including short pages' <main>) to stretch to the oversized sidebar's
 * height. The section containing the current page always auto-expands,
 * regardless of stored state, so navigating never leaves you looking at a
 * collapsed section with no visible indication of where you are.
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>(readExpanded);

  const activeSection = sections.find((s) => s.pages.some((p) => p.route === location.pathname));

  // Auto-expand the section containing the current page whenever it
  // changes, without clobbering any other section the user already opened.
  useEffect(() => {
    if (!activeSection || expanded[activeSection.id]) return;
    setExpanded((prev) => ({ ...prev, [activeSection.id]: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection?.id]);

  useEffect(() => {
    window.localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded));
  }, [expanded]);

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
        const sectionActive = section.id === activeSection?.id;
        const isOpen = !!expanded[section.id];
        return (
          <div key={section.id} style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
              aria-expanded={isOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: sectionActive ? 'var(--nm-accent-primary)' : 'var(--nm-text-muted)',
                marginBottom: 6,
                textAlign: 'left',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 120ms ease',
                  fontSize: 9,
                }}
              >
                ▶
              </span>
              <span style={{ flex: 1 }}>{section.label}</span>
            </button>
            {isOpen &&
              section.pages.map((page) => (
                <NavLink
                  key={page.route}
                  to={page.route}
                  onClick={onNavigate}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '6px 0 6px 15px',
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
