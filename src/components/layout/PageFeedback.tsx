import type { DocPage } from '../../lib/contentTree';

const REPO = 'ravivarmapatturi/NeuralMastery-vite';
const BRANCH = 'main';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
}

/** The two lightweight, backend-free feedback mechanisms a static
 * GitHub-Pages site can actually offer: a prefilled "new issue" link
 * (GitHub's own query-param prefill, no server of ours involved) and a
 * direct "edit this page" link into GitHub's own in-browser editor --
 * the same "Edit this page" pattern most OSS docs sites use. Paired with
 * a real "last updated" date sourced from git history (not filesystem
 * mtime, which resets on every fresh checkout). */
export default function PageFeedback({ page }: { page: DocPage }) {
  const filePath = `src/content/docs/${page.slug}.mdx`;
  const editUrl = `https://github.com/${REPO}/edit/${BRANCH}/${filePath}`;
  const issueUrl = `https://github.com/${REPO}/issues/new?${new URLSearchParams({
    title: `Content issue: ${page.title}`,
    body: `Page: ${page.route}\n\nWhat's wrong or outdated:\n\n`,
    labels: 'content-feedback',
  })}`;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem 1rem',
        alignItems: 'center',
        marginTop: '1.5rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--nm-border)',
        fontSize: 12.5,
        color: 'var(--nm-text-muted)',
      }}
    >
      {page.lastUpdated && <span>Last updated {formatDate(page.lastUpdated)}</span>}
      <a href={editUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--nm-text-muted)' }}>
        Edit this page
      </a>
      <a href={issueUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--nm-text-muted)' }}>
        Report an issue
      </a>
    </div>
  );
}
