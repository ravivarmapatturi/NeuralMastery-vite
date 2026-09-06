import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeHead, runAttention, tokenize } from '../../viz/lib/attention';

type Concept = 'algebra' | 'gradient' | 'attention' | 'llm' | 'rag' | 'agent';

const concepts: Array<{ id: Concept; label: string; route: string; title: string; subtitle: string; stages: string[] }> = [
  { id: 'algebra', label: 'Linear algebra', route: '/docs/mathematics-for-ai/overview', title: 'A vector transforms', subtitle: 'Matrix multiplication is the first computation behind every model.', stages: ['vector', 'matrix', 'transform', 'result'] },
  { id: 'gradient', label: 'Gradient descent', route: '/docs/machine-learning/linear-regression', title: 'Loss moves downhill', subtitle: 'A real update rule changes the parameters on each step.', stages: ['parameters', 'prediction', 'loss', 'gradient'] },
  { id: 'attention', label: 'Attention', route: '/docs/deep-learning/attention-transformers', title: 'Tokens attend to tokens', subtitle: 'Q · Kᵀ / √d → softmax → weighted values, computed in the page.', stages: ['tokens', 'Q K V', 'scores', 'attention'] },
  { id: 'llm', label: 'LLM', route: '/docs/llms-genai/overview', title: 'Logits become a next-token distribution', subtitle: 'Softmax turns a model score vector into probabilities.', stages: ['prompt', 'tokens', 'logits', 'probabilities'] },
  { id: 'rag', label: 'RAG', route: '/docs/llms-genai/overview', title: 'A query retrieves context', subtitle: 'Embedding similarity ranks the documents before generation.', stages: ['query', 'embed', 'retrieve', 'context'] },
  { id: 'agent', label: 'Agent', route: '/docs/agents/overview', title: 'A system executes a plan', subtitle: 'Goal, tool call, observation, and next action form an operating loop.', stages: ['goal', 'plan', 'tool', 'observe'] },
];

const softmax = (values: number[]) => {
  const max = Math.max(...values);
  const exp = values.map((v) => Math.exp(v - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((v) => v / sum);
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Bars({ labels, values }: { labels: string[]; values: number[] }) {
  return <div className="nm-live-bars">{labels.map((label, index) => <div key={label}><span>{label}</span><i><b style={{ width: `${Math.max(3, values[index] * 100)}%` }} /></i><em>{(values[index] * 100).toFixed(0)}%</em></div>)}</div>;
}

export default function LiveComputation() {
  const [selected, setSelected] = useState<Concept>('attention');
  const [tick, setTick] = useState(0);
  const reducedMotion = useReducedMotion();
  const concept = concepts.find((entry) => entry.id === selected)!;
  const attention = useMemo(() => runAttention(tokenize('models learn relationships'), makeHead(1)), []);
  const llmProbabilities = useMemo(() => softmax([2.8, 1.6, 0.9, 0.3]), []);
  const retrieval = useMemo(() => softmax([0.92, 0.63, 0.31]), []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const interval = window.setInterval(() => setTick((value) => value + 1), 1400);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => setTick(0), [selected]);
  const activeStage = reducedMotion ? concept.stages.length - 1 : tick % concept.stages.length;
  const gradientX = 4 * Math.pow(0.72, Math.min(tick, 10));
  const gradientLoss = gradientX ** 2;
  const attentionValues = attention.weights[0];

  return <section className="nm-live-computation" aria-labelledby="live-computation-heading">
    <div className="nm-live-topbar"><span><i aria-hidden="true" /> live deterministic computation</span><span>{reducedMotion ? 'motion paused' : `step ${activeStage + 1}/${concept.stages.length}`}</span></div>
    <div className="nm-live-body">
      <div className="nm-live-heading"><div><p>LIVE CONCEPT SYSTEM</p><h2 id="live-computation-heading">{concept.title}</h2><small>{concept.subtitle}</small></div><Link to={concept.route}>Open lesson →</Link></div>
      <div className="nm-live-pipeline" aria-label={`${concept.label} computation stages`}>
        {concept.stages.map((stage, index) => <div className={index <= activeStage ? 'is-active' : ''} key={stage}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage}</strong></div>)}
      </div>
      <div className="nm-live-output" aria-live="polite">
        {selected === 'algebra' && <><div className="nm-vector-line">[2, −1] <b>×</b> <span>[[1, 2], [−.5, 1]]</span> <b>=</b> <strong>[0, −2]</strong></div><p>Computed matrix × vector transformation</p></>}
        {selected === 'gradient' && <><div className="nm-gradient-readout"><span>θ = {gradientX.toFixed(3)}</span><span>loss = {gradientLoss.toFixed(3)}</span><span>∂L/∂θ = {(2 * gradientX).toFixed(3)}</span></div><div className="nm-loss-track"><b style={{ left: `${50 + Math.min(40, gradientX * 10)}%` }} /></div><p>θ ← θ − 0.14 · ∂L/∂θ</p></>}
        {selected === 'attention' && <><div className="nm-token-row">{tokenize('models learn relationships').map((token, index) => <span className={index === 0 ? 'is-query' : ''} key={token}>{token}</span>)}</div><Bars labels={tokenize('models learn relationships')} values={attentionValues} /><p>Real Q · Kᵀ / √d scores normalized with softmax</p></>}
        {selected === 'llm' && <><div className="nm-token-row"><span className="is-query">attention</span><b>→</b><span>next token</span></div><Bars labels={['mechanism', 'layer', 'pattern', 'model']} values={llmProbabilities} /><p>Softmax(logits) → probability distribution</p></>}
        {selected === 'rag' && <><div className="nm-rag-trace"><span>What is RAG?</span><b>→ embed →</b><strong>top context</strong></div><Bars labels={['retrieval.md', 'rag-systems.md', 'agents.md']} values={retrieval} /><p>Cosine-like similarity scores ranked before context assembly</p></>}
        {selected === 'agent' && <><div className="nm-agent-trace">{['goal', 'plan', 'search docs', 'observe'].map((step, index) => <span className={index <= activeStage ? 'is-active' : ''} key={step}>{step}</span>)}</div><p>Execution trace: the active node advances through a real agent loop.</p></>}
      </div>
    </div>
    <div className="nm-live-tabs" role="tablist" aria-label="Choose a live AI computation">
      {concepts.map((entry) => <button key={entry.id} role="tab" aria-selected={selected === entry.id} type="button" onClick={() => setSelected(entry.id)}>{entry.label}</button>)}
    </div>
  </section>;
}
