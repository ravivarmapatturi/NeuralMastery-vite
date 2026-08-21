import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const CLIENT_CAPS = [
  { key: 'roots', label: 'roots', desc: 'Ability to provide filesystem roots -- which directories the server is allowed to operate within.' },
  { key: 'sampling', label: 'sampling', desc: 'Support for the server requesting an LLM completion FROM the client -- lets a server ask the client\'s model to do something, inverting the usual direction.' },
  { key: 'elicitation', label: 'elicitation', desc: 'Support for the server asking the user a follow-up question mid-tool-call, rather than failing on missing information.' },
];
const SERVER_CAPS = [
  { key: 'tools', label: 'tools', desc: 'Exposes callable tools -- declares listChanged if it will notify on tool-list changes.' },
  { key: 'resources', label: 'resources', desc: 'Provides readable resources -- can declare subscribe (per-item change notifications) and listChanged separately.' },
  { key: 'prompts', label: 'prompts', desc: 'Offers reusable prompt templates.' },
  { key: 'logging', label: 'logging', desc: 'Emits structured log messages back to the client.' },
  { key: 'completions', label: 'completions', desc: 'Supports argument autocompletion for tool/prompt parameters.' },
];

/** Client and server each declare a capability set during initialize
 * -- only capabilities BOTH sides negotiated are usable afterward.
 * Click one from either side. */
export default function CapabilityNegotiationDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('tools');
  const color = getConceptColor(t, 'attention');
  const all = [...CLIENT_CAPS, ...SERVER_CAPS];
  const x = all.find((y) => y.key === active)!;

  return (
    <VisualizationContainer footer={x.desc}>
      <div style={{ fontSize: 8.5, color: t.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>Client capabilities</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {CLIENT_CAPS.map((y) => {
          const isActive = active === y.key;
          return (
            <div key={y.key} onClick={() => setActive(y.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(y.key); } }} onMouseEnter={() => setActive(y.key)} style={{ cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{y.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 8.5, color: t.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>Server capabilities</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {SERVER_CAPS.map((y) => {
          const isActive = active === y.key;
          return (
            <div key={y.key} onClick={() => setActive(y.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(y.key); } }} onMouseEnter={() => setActive(y.key)} style={{ cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{y.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
