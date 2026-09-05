import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import AttentionStepThrough from '../viz/AttentionStepThrough';
import { getFlatPages, getPracticeProblems } from '../lib/contentTree';
import { SECTION_META, SECTION_ORDER } from '../data/sectionMeta';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { useProgress } from '../contexts/ProgressContext';

const loop = [
  ['01', 'Understand', 'Read a precise explanation built from first principles.'],
  ['02', 'Visualize', 'Change the inputs and watch the computation respond.'],
  ['03', 'Implement', 'Turn the idea into working Python.'],
  ['04', 'Practice', 'Run against real tests and earn the next concept.'],
];

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

/** The public product landing page. It keeps the two real destinations, but
 * frames them as one learning loop instead of unrelated products. */
export default function ChooserPage() {
  useDocumentTitle('See it. Understand it. Build it.');
  useDocumentMeta(
    'Learn AI deeply',
    'Learn AI from first principles through computed visualizations and executable practice, from mathematics to LLMs and agents.',
  );

  const pages = getFlatPages();
  const problems = getPracticeProblems();
  const { countWithin } = useProgress();
  const completed = countWithin(pages.map((page) => page.route));
  const featuredProblem = problems.find((problem) => problem.topic?.toLowerCase().includes('attention')) ?? problems[0];

  return (
    <div className="nm-landing">
      <Navbar />
      <main>
        <section className="nm-landing-hero">
          <div className="nm-landing-shell nm-hero-grid">
            <div className="nm-hero-copy">
              <p className="nm-eyebrow">Interactive AI engineering curriculum</p>
              <h1>See it.<br />Understand it.<br /><em>Build it.</em></h1>
              <p className="nm-hero-lede">
                Learn AI through real computation, interactive visualizations, and executable practice—from foundations to LLMs and agents.
              </p>
              <div className="nm-hero-actions">
                <Link className="nm-button nm-button-primary" to={completed ? '/progress' : '/learn'}>
                  {completed ? 'Continue learning' : 'Explore the curriculum'} <Arrow />
                </Link>
                <Link className="nm-button nm-button-secondary" to="/practice">Try a coding problem <Arrow /></Link>
              </div>
              <div className="nm-proof-row" aria-label="Platform coverage">
                <div><strong>{pages.length}+</strong><span>learning pages</span></div>
                <div><strong>{problems.length}+</strong><span>coding problems</span></div>
                <div><strong>7</strong><span>AI disciplines</span></div>
              </div>
            </div>
            <div className="nm-hero-demo">
              <div className="nm-demo-caption"><span className="nm-live-dot" /> Live product preview <Link to="/docs/deep-learning/attention-transformers">Explore attention <Arrow /></Link></div>
              <AttentionStepThrough />
            </div>
          </div>
        </section>

        <section className="nm-landing-section nm-loop-section" aria-labelledby="mastery-loop">
          <div className="nm-landing-shell">
            <div className="nm-section-intro">
              <p className="nm-eyebrow">The Neural Mastery method</p>
              <h2 id="mastery-loop">One concept. A complete learning loop.</h2>
              <p>Static tutorials stop at explanation. Here, each idea can move from intuition to a result you can inspect and implement.</p>
            </div>
            <ol className="nm-mastery-loop">
              {loop.map(([number, title, text]) => <li key={number}>
                <span>{number}</span><div><h3>{title}</h3><p>{text}</p></div>
              </li>)}
            </ol>
          </div>
        </section>

        <section className="nm-landing-section nm-curriculum-section" aria-labelledby="curriculum-heading">
          <div className="nm-landing-shell">
            <div className="nm-section-heading-row">
              <div className="nm-section-intro">
                <p className="nm-eyebrow">A curriculum with range</p>
                <h2 id="curriculum-heading">Start with the layer you need. Keep going without leaving the platform.</h2>
              </div>
              <Link className="nm-text-link" to="/learn">Browse all topics <Arrow /></Link>
            </div>
            <div className="nm-curriculum-grid">
              {SECTION_ORDER.map((key, index) => {
                const section = SECTION_META[key];
                return <Link className="nm-curriculum-card" to={key} key={key} style={{ '--section-color': section.color } as React.CSSProperties}>
                  <span className="nm-curriculum-index">0{index + 1}</span>
                  <span className="nm-curriculum-icon" aria-hidden="true">{section.icon}</span>
                  <h3>{section.label}</h3>
                  <p>{section.description}</p>
                  <span className="nm-card-foot">{section.pageCount} pages <Arrow /></span>
                </Link>;
              })}
            </div>
          </div>
        </section>

        <section className="nm-landing-section nm-practice-section" aria-labelledby="practice-heading">
          <div className="nm-landing-shell nm-practice-grid">
            <div className="nm-section-intro">
              <p className="nm-eyebrow">Learn it. Then prove it.</p>
              <h2 id="practice-heading">Practice the algorithms you just learned.</h2>
              <p>Move from concepts to implementation in a browser-based Python environment with real test cases—no vague LLM grading.</p>
              <Link className="nm-button nm-button-primary" to="/practice">Browse {problems.length} problems <Arrow /></Link>
            </div>
            {featuredProblem && <Link className="nm-problem-preview" to={featuredProblem.route}>
              <div className="nm-code-top"><span>practice/{featuredProblem.slug.split('/').pop()}</span><span className="nm-code-status">tests ready</span></div>
              <pre aria-label="Python coding problem preview"><code><span className="nm-code-muted">def</span> <span className="nm-code-name">solve</span>(inputs):{'\n'}  <span className="nm-code-muted"># implement the concept</span>{'\n'}  <span className="nm-code-muted">return</span> result</code></pre>
              <div className="nm-test-row"><span className="nm-test-check">✓</span><span>Run against real test cases</span><strong>{featuredProblem.title} <Arrow /></strong></div>
            </Link>}
          </div>
        </section>

        <section className="nm-final-cta">
          <div className="nm-landing-shell">
            <p className="nm-eyebrow">Build durable intuition</p>
            <h2>Understand the computation.<br />Then make it yours.</h2>
            <p>Choose a starting point, explore the system, and build real AI/ML skill one concept at a time.</p>
            <Link className="nm-button nm-button-primary" to="/learn">Start learning AI <Arrow /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
