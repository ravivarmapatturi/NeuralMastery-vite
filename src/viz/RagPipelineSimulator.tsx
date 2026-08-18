import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useVizTokens, SPACING, RADIUS, FONT_FAMILY, type VizTokens } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, Slider, PillSelect, ControlRow } from './primitives';
import { chunkCorpus, retrieve, rerank, type ScoredChunk, type RerankedChunk } from './lib/rag';

function matchScore(r: ScoredChunk | RerankedChunk): number {
  return 'rerankScore' in r ? r.rerankScore : r.score;
}

const STAGE_INFO: Record<string, string> = {
  document: 'The raw source documents to be indexed -- in this demo, eight short passages covering different ML topics.',
  chunking: 'Splits documents into fixed-size pieces. Too small loses surrounding context; too large dilutes each chunk’s embedding specificity -- try dragging the chunk-size slider and watch the chunk count change.',
  embeddings: 'Each chunk gets converted into a vector representation. This demo uses bag-of-words vectors for speed and transparency; a real system uses a trained embedding model.',
  vectorstore: 'Where embedded chunks are indexed for fast nearest-neighbor lookup at query time.',
  query: 'Your question, embedded the same way as the chunks so it can be compared against them.',
  retrieval: 'Ranks every chunk by similarity to the query and keeps the top-k -- adjust the top-k slider and watch the result count change.',
  reranker: 'An optional second, more precise scoring pass over just the retrieved candidates -- toggle it off and watch the ranking get coarser.',
  llm: 'Generates an answer grounded in whichever chunks made it through retrieval (and reranking, if enabled).',
  answer: 'The final response -- only as good as the chunks that reached this point.',
};

function buildFlow(t: VizTokens, rerankerOn: boolean): { nodes: Node[]; edges: Edge[] } {
  const nodeStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: RADIUS.sm,
    color: t.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    padding: 8,
    width: 150,
    textAlign: 'center',
    ...extra,
  });
  const edgeStyle = { stroke: t.edge, strokeWidth: 1.5 };

  const nodes: Node[] = [
    { id: 'document', position: { x: 0, y: 0 }, data: { label: 'Document' }, style: nodeStyle() },
    { id: 'chunking', position: { x: 0, y: 80 }, data: { label: 'Chunking' }, style: nodeStyle() },
    { id: 'embeddings', position: { x: 0, y: 160 }, data: { label: 'Embeddings' }, style: nodeStyle() },
    { id: 'vectorstore', position: { x: 0, y: 240 }, data: { label: 'Vector Store' }, style: nodeStyle({ borderColor: t.accentSecondary }) },
    { id: 'query', position: { x: 260, y: 240 }, data: { label: 'Query' }, style: nodeStyle({ borderColor: t.accentWarn }) },
    { id: 'retrieval', position: { x: 130, y: 320 }, data: { label: 'Retrieval' }, style: nodeStyle() },
    {
      id: 'reranker',
      position: { x: 130, y: 400 },
      data: { label: rerankerOn ? 'Reranker (on)' : 'Reranker (off)' },
      style: nodeStyle({ opacity: rerankerOn ? 1 : 0.4 }),
    },
    { id: 'llm', position: { x: 130, y: 480 }, data: { label: 'LLM' }, style: nodeStyle({ borderColor: t.accentPrimary }) },
    { id: 'answer', position: { x: 130, y: 560 }, data: { label: 'Answer' }, style: nodeStyle({ background: t.accentPrimary, color: t.background, fontWeight: 700 }) },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'document', target: 'chunking', style: edgeStyle },
    { id: 'e2', source: 'chunking', target: 'embeddings', style: edgeStyle },
    { id: 'e3', source: 'embeddings', target: 'vectorstore', style: edgeStyle },
    { id: 'e4', source: 'vectorstore', target: 'retrieval', style: edgeStyle },
    { id: 'e5', source: 'query', target: 'retrieval', style: edgeStyle },
    { id: 'e6', source: 'retrieval', target: 'reranker', style: edgeStyle, animated: rerankerOn },
    { id: 'e7', source: 'reranker', target: 'llm', style: edgeStyle },
    { id: 'e8', source: 'llm', target: 'answer', style: edgeStyle, animated: true },
  ];

  return { nodes, edges };
}

const CHUNK_SIZE_OPTIONS = [
  { value: 8, label: '8 words' },
  { value: 16, label: '16 words' },
  { value: 30, label: '30 words' },
];

export default function RagPipelineSimulator() {
  const t = useVizTokens();
  const [query, setQuery] = useState('how does gradient descent choose a learning rate?');
  const [chunkSize, setChunkSize] = useState(16);
  const [topK, setTopK] = useState(3);
  const [rerankerOn, setRerankerOn] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const chunks = useMemo(() => chunkCorpus(chunkSize), [chunkSize]);
  const results = useMemo(() => {
    const retrieved = retrieve(query, chunks, topK);
    return rerankerOn ? rerank(query, retrieved) : retrieved;
  }, [query, chunks, topK, rerankerOn]);

  const { nodes, edges } = useMemo(() => buildFlow(t, rerankerOn), [t, rerankerOn]);

  return (
    <VisualizationContainer
      footer="Real chunking, real bag-of-words cosine-similarity retrieval, and a real (if simplified) reranking pass -- type any question about the topics covered in the demo corpus and watch retrieval actually respond."
    >
      <VisualizationHeader eyebrow="Interactive" title="RAG Pipeline Simulator" />

      <div style={{ marginBottom: SPACING.sm }}>
        <label style={{ display: 'block', fontSize: 14, color: t.textSecondary, marginBottom: 6 }}>Question</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: RADIUS.sm,
            border: `1px solid ${t.border}`,
            background: t.background,
            color: t.textPrimary,
            fontFamily: FONT_FAMILY,
            fontSize: 15,
          }}
        />
      </div>

      <ControlRow>
        <PillSelect<number> label="Chunk size" value={chunkSize} onChange={setChunkSize} options={CHUNK_SIZE_OPTIONS} />
        <div style={{ minWidth: 160 }}>
          <Slider label="Top-k" value={topK} onChange={setTopK} min={1} max={5} step={1} />
        </div>
        <PillSelect<string>
          label="Reranker"
          value={rerankerOn ? 'on' : 'off'}
          onChange={(v) => setRerankerOn(v === 'on')}
          options={[
            { value: 'on', label: 'On' },
            { value: 'off', label: 'Off' },
          ]}
        />
      </ControlRow>

      <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: 460, height: 420, border: `1px solid ${t.border}`, borderRadius: RADIUS.md, overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
          >
            <Background color={t.border} gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          {selectedNode && (
            <div
              style={{
                fontSize: 13,
                color: t.textSecondary,
                background: t.surfaceAlt,
                border: `1px solid ${t.border}`,
                borderRadius: RADIUS.sm,
                padding: 10,
                marginBottom: SPACING.sm,
              }}
            >
              <strong style={{ color: t.textPrimary }}>{selectedNode}:</strong> {STAGE_INFO[selectedNode]}
            </div>
          )}
          <div style={{ fontSize: 13, color: t.textSecondary, marginBottom: 6 }}>
            {chunks.length} chunks indexed &middot; showing top {results.length}
          </div>
          {results.map((r, i) => (
            <div
              key={r.id}
              style={{ fontSize: 13, background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: RADIUS.sm, padding: 8, marginBottom: 6 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: t.accentPrimary, fontWeight: 700, marginBottom: 4 }}>
                <span>#{i + 1}</span>
                <span>{(matchScore(r) * 100).toFixed(1)}% match</span>
              </div>
              <div style={{ color: t.textPrimary }}>{r.text}</div>
            </div>
          ))}
          {results.length === 0 && (
            <div style={{ fontSize: 13, color: t.textMuted }}>No chunks matched this query at all -- try different wording.</div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}
