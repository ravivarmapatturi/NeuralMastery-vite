import { useState } from 'react';
import VisualizationContainer from './primitives/VisualizationContainer';

type CapKind = 'tools' | 'resources' | 'prompts' | 'sampling';

const CAP_DETAILS: Record<CapKind, {
  tag: string;
  actionVerb: string;
  summary: string;
  color: string;
  diagramVisual: string;
  example: string;
}> = {
  tools: {
    tag: 'TOOLS',
    actionVerb: 'The LLM can DO something (Execute Action)',
    summary: 'Executable functions with side effects or computed operations that the model invokes automatically.',
    color: '#38bdf8',
    diagramVisual: 'LLM ──(tools/call)──> [MCP SERVER] ──(Executes)──> External System',
    example: '`query_postgres_db(sql)` or `create_github_issue(title)`'
  },
  resources: {
    tag: 'RESOURCES',
    actionVerb: 'The LLM can READ something (Passive Context)',
    summary: 'Read-only data sources identified by URIs (`file://`, `postgres://`) pulled in as context.',
    color: '#a855f7',
    diagramVisual: 'Host ──(resources/read)──> [MCP SERVER] ──(Reads File/DB)──> Returns Text',
    example: '`file:///workspace/schema.sql` or `postgres://analytics/users`}'
  },
  prompts: {
    tag: 'PROMPTS',
    actionVerb: 'The User can START a workflow (Template)',
    summary: 'Pre-configured prompt templates and workflows triggered by user selection with custom inputs.',
    color: '#f59e0b',
    diagramVisual: 'User ──(Selects Prompt)──> [MCP SERVER] ──(Fills Template)──> LLM Context',
    example: '`summarize_incident(topic)` or `code_review_style`}'
  },
  sampling: {
    tag: 'SAMPLING',
    actionVerb: 'The Server can ASK the Host model (LLM Recursion)',
    summary: 'Server-initiated requests asking the Host LLM to generate completions for recursive validation.',
    color: '#10b981',
    diagramVisual: 'MCP Server ──(sampling/createMessage)──> Host LLM ──(Generates)──> Server',
    example: 'Server asks Host LLM to review generated code before returning result.'
  }
};

export default function McpCapabilitiesPlayground() {
  const [active, setActive] = useState<CapKind>('tools');
  const details = CAP_DETAILS[active];

  return (
    <VisualizationContainer>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a855f7', fontWeight: 700, marginBottom: '4px' }}>
        MCP Server Capability Matrix
      </div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc', fontWeight: 800 }}>
        Interactive Capabilities Playground
      </h3>

      {/* 4 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {(['tools', 'resources', 'prompts', 'sampling'] as CapKind[]).map((kind) => {
          const info = CAP_DETAILS[kind];
          const isSelected = active === kind;
          return (
            <div
              key={kind}
              onClick={() => setActive(kind)}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(15, 23, 42, 0.9)' : '#090d16',
                border: isSelected ? `2px solid ${info.color}` : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 15px ${info.color}33` : 'none'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: info.color, letterSpacing: '0.05em' }}>
                {info.tag}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#ffffff' : '#cbd5e1', marginTop: '4px' }}>
                {info.actionVerb.split('(')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Details Display */}
      <div style={{ padding: '16px', borderRadius: '12px', background: '#020617', border: `1px solid ${details.color}` }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: details.color, marginBottom: '6px' }}>
          {details.actionVerb}
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
          {details.summary}
        </p>

        <div style={{ padding: '12px', background: '#0b0f19', borderRadius: '8px', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px', fontFamily: 'monospace', textAlign: 'center', marginBottom: '10px' }}>
          {details.diagramVisual}
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          <strong style={{ color: '#f8fafc' }}>Example Usage:</strong> {details.example}
        </div>
      </div>
    </VisualizationContainer>
  );
}
