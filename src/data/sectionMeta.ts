// Hand-curated metadata for the 7 top-level sidebar groups, keyed by the
// group's generated-index page href. Time estimates are an honest range
// derived from page count x a realistic 15-25 min/page for this site's
// technical density -- not a false-precision single number, and not a
// fixed weekly cohort pace (this isn't a scheduled course). `subsections`
// labels come directly from each folder's own category metadata, not
// re-typed by hand.

export interface Subsection {
  dir: string;
  label: string;
  landing?: string;
}

export interface SectionMetaEntry {
  label: string;
  icon: string;
  color: string;
  description: string;
  pageCount: number;
  difficulty: string;
  prerequisites: string;
  leadsTo: string;
  subsections: Subsection[];
  folders?: string[];
}

export const SECTION_META: Record<string, SectionMetaEntry> = {
  '/docs/category/foundations': {
    label: 'Foundations',
    icon: '🧱',
    color: '#3DDC97',
    description: 'Systems, Python, and math fundamentals — before any AI-specific content.',
    pageCount: 17,
    difficulty: 'Beginner',
    prerequisites: 'None — this is the entry point.',
    leadsTo: 'Models',
    subsections: [
      { dir: 'cs-fundamentals', label: 'CS Fundamentals for AI Engineers' },
      { dir: 'python-engineering', label: 'Python Engineering for AI' },
      { dir: 'mathematics-for-ai', label: 'Mathematics for AI' },
    ],
  },
  '/docs/category/models': {
    label: 'Models',
    icon: '🧠',
    color: '#5B8CFF',
    description: 'Classical ML through modern LLMs — every model family covered in depth.',
    pageCount: 76,
    difficulty: 'Intermediate → Advanced',
    prerequisites: 'Foundations',
    leadsTo: 'Agents & Applications',
    subsections: [
      { dir: 'machine-learning', label: 'Machine Learning' },
      { dir: 'deep-learning', label: 'Deep Learning' },
      { dir: 'computer-vision', label: 'Computer Vision' },
      { dir: 'nlp', label: 'NLP' },
      { dir: 'speech-audio', label: 'Speech & Audio AI' },
      { dir: 'llms-genai', label: 'LLMs & GenAI' },
      { dir: 'graph-ml', label: 'Graph ML' },
      { dir: 'reinforcement-learning', label: 'Reinforcement Learning' },
    ],
  },
  '/docs/category/agents--applications': {
    label: 'Agents & Applications',
    icon: '🤖',
    color: '#F4B942',
    description: 'Agentic systems, and where AI meets specific domains — science, healthcare, and beyond.',
    pageCount: 16,
    difficulty: 'Advanced',
    prerequisites: 'Models — especially LLMs & GenAI',
    leadsTo: 'Systems & Infrastructure',
    subsections: [
      { dir: 'agents', label: 'Agents' },
      { dir: 'ai-for-science', label: 'AI for Science' },
      { dir: 'domain-applications', label: 'Domain AI Applications' },
    ],
  },
  '/docs/category/systems--infrastructure': {
    label: 'Systems & Infrastructure',
    icon: '🏗️',
    color: '#F45B5B',
    description: 'Designing, building, and running production ML/AI systems at scale.',
    pageCount: 51,
    difficulty: 'Advanced',
    prerequisites: 'Agents & Applications',
    leadsTo: 'Safety & Evaluation',
    subsections: [
      { dir: 'ml-system-design', label: 'ML System Design' },
      { dir: 'mlops', label: 'MLOps' },
      { dir: 'databases', label: 'Databases' },
      { dir: 'frameworks', label: 'Frameworks' },
      { dir: 'cli-reference', label: 'CLI Reference' },
    ],
  },
  '/docs/category/safety--evaluation': {
    label: 'Safety & Evaluation',
    icon: '🛡️',
    color: '#B15BFF',
    description: 'Knowing whether a system is good, secure, and safe — not just whether it runs.',
    pageCount: 17,
    difficulty: 'Advanced',
    prerequisites: 'Systems & Infrastructure',
    leadsTo: 'Research & Build',
    subsections: [
      { dir: 'ai-evaluation', label: 'AI Evaluation' },
      { dir: 'ai-security', label: 'AI Security' },
      { dir: 'ai-safety', label: 'AI Safety & Alignment' },
      { dir: 'interpretability', label: 'Interpretability' },
    ],
  },
  '/docs/category/research--build': {
    label: 'Research & Build',
    icon: '🔬',
    color: '#31C4D9',
    description: 'Reading the literature, and building real things — from scratch, and as full projects.',
    pageCount: 24,
    difficulty: 'Advanced',
    prerequisites: 'Safety & Evaluation',
    leadsTo: 'Career',
    subsections: [
      { dir: 'research-engineering', label: 'Research Engineering' },
      { dir: 'build-from-scratch', label: 'Build From Scratch' },
      { dir: 'projects', label: 'Projects' },
      { dir: 'visual-lab', label: 'Visual Lab' },
    ],
  },
  '/docs/category/career': {
    label: 'Career',
    icon: '🎯',
    color: '#FF7A45',
    description: 'Tying everything together into a learning path and interview readiness.',
    pageCount: 10,
    difficulty: 'All levels',
    prerequisites: 'Whatever you have covered so far',
    leadsTo: '— you are interview-ready.',
    subsections: [
      { dir: 'interview-prep', label: 'Interview Prep' },
      { dir: 'roadmaps', label: 'Roadmaps', landing: '/docs/roadmaps/overview' },
      { dir: 'resources', label: 'Resources', landing: '/docs/resources/open-source-ai-resources' },
    ],
  },
};

export const SECTION_ORDER: string[] = Object.keys(SECTION_META);

export const TOTAL_PAGES: number = SECTION_ORDER.reduce((sum, key) => sum + SECTION_META[key].pageCount, 0);

/** "4-7 hrs (17 pages)" -- a 15-25 min/page range, not false precision. */
export function timeEstimate(pageCount: number): string {
  const lo = Math.round((pageCount * 15) / 60) || 1;
  const hi = Math.round((pageCount * 25) / 60) || 1;
  return `${lo}-${hi} hrs (${pageCount} pages)`;
}

/** Fraction (0..1) of a top-level group's pages marked understood --
 * matches a page's permalink against the group's folders/subsections, the
 * same "which pages count toward this group" logic LearningPathMap and
 * the progress dashboard both need. */
export function completionFor(key: string, understood: Record<string, boolean>): number {
  const meta = SECTION_META[key];
  const done = Object.keys(understood).filter((permalink) =>
    meta.folders ? meta.folders.some((f) => permalink.includes(`/docs/${f}/`)) : meta.subsections.some((s) => permalink.includes(`/docs/${s.dir}/`)),
  ).length;
  return Math.min(1, done / meta.pageCount);
}
