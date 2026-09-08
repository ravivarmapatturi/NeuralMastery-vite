import type { DocPage } from './contentTree';
import { SECTION_META, SECTION_ORDER } from '../data/sectionMeta';

export interface PracticeTrack {
  topic: string;
  slug: string;
  label: string;
  count: number;
}

/** A handful of practice-problem batches tagged `topic:` with a raw,
 * programmer-facing key that matches neither a SECTION_META subsection dir
 * nor an already-human-readable label (e.g. "data-structures-algorithms",
 * "agents,-mcp-systems" -- note the stray comma, a real artifact of how
 * that batch's frontmatter was generated). Without this override these
 * would render as-is in "Explore by Track & Tag" -- confirmed via a real
 * Playwright check against the built site, not assumed. */
const RAW_TOPIC_LABEL_OVERRIDES: Record<string, string> = {
  'data-structures-algorithms': 'Data Structures & Algorithms',
  'classical-ml': 'Classical ML',
  'deep-learning-vision/nlp': 'Deep Learning: Vision & NLP',
  'math-numerical': 'Math & Numerical Computing',
  'numpy-pandas': 'NumPy & Pandas',
  'python-fundamentals': 'Python Fundamentals',
  'transformers-llms': 'Transformers & LLMs',
  'agents,-mcp-systems': 'Agents, MCP & Systems',
};

/** dir (e.g. "mathematics-for-ai") -> its real, human label (e.g.
 * "Mathematics for AI") -- most `topic:` frontmatter values are these exact
 * subsection dirs, but several real-ification batches used an already
 * human-readable topic string directly (e.g. "Agent Loop Engineering") --
 * this lookup returns the topic unchanged when there's no dir match, which
 * is exactly the right behavior for those. A small number of remaining
 * batches used a raw, non-human key covered by RAW_TOPIC_LABEL_OVERRIDES
 * above instead. */
export function buildTopicLabels(): Record<string, string> {
  const labels: Record<string, string> = { ...RAW_TOPIC_LABEL_OVERRIDES };
  for (const key of SECTION_ORDER) {
    for (const sub of SECTION_META[key].subsections) labels[sub.dir] = sub.label;
  }
  return labels;
}

/** Real topic strings are inconsistent (kebab-case dirs, comma-containing
 * strings like "agents,-mcp-systems", slash-containing strings like
 * "deep-learning-vision/nlp", Title Case labels) -- this produces a clean,
 * URL-safe slug from any of them. */
export function slugifyTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The full list of tracks with real counts, computed from the actual
 * problem catalogue -- never hardcoded, so it always reflects what's
 * really shipped as content ships. Slugs are guaranteed unique (a
 * collision gets a numeric suffix) so /practice/track/:slug always
 * resolves to exactly one real topic. */
export function getPracticeTracks(problems: DocPage[]): PracticeTrack[] {
  const labels = buildTopicLabels();
  const counts: Record<string, number> = {};
  for (const p of problems) {
    if (p.topic) counts[p.topic] = (counts[p.topic] ?? 0) + 1;
  }

  const usedSlugs = new Set<string>();
  const tracks: PracticeTrack[] = Object.keys(counts)
    .sort((a, b) => (labels[a] ?? a).localeCompare(labels[b] ?? b))
    .map((topic) => {
      let slug = slugifyTopic(topic);
      let n = 2;
      while (usedSlugs.has(slug)) {
        slug = `${slugifyTopic(topic)}-${n}`;
        n += 1;
      }
      usedSlugs.add(slug);
      return { topic, slug, label: labels[topic] ?? topic, count: counts[topic] };
    });

  return tracks.sort((a, b) => b.count - a.count);
}

export function findTrackBySlug(problems: DocPage[], slug: string): PracticeTrack | undefined {
  return getPracticeTracks(problems).find((t) => t.slug === slug);
}
