import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const CONCEPTS = [
  { key: 'provider', label: 'Provider', desc: 'A plugin that lets Terraform talk to a specific platform (AWS, GCP, Azure, Kubernetes, even SaaS like Datadog) -- declared once, resources defined against it.' },
  { key: 'resource', label: 'Resource', desc: "The actual infrastructure being declared -- resource \"aws_instance\" \"training_node\" { ... } -- Terraform's core building block." },
  { key: 'variable', label: 'Variable', desc: 'Parameterizes a configuration (instance type, region, environment name) so the same code deploys dev, staging, and prod with different inputs.' },
  { key: 'output', label: 'Output', desc: "A value exposed after apply (a generated endpoint URL, a resource ID) -- consumed by other Terraform configs or by humans/CI." },
  { key: 'module', label: 'Module', desc: 'A reusable, parameterized bundle of resources -- package "a standard VPC" once, reuse it across projects instead of copy-pasting resources.' },
  { key: 'workspace', label: 'Workspace', desc: 'Manages multiple instances of the same configuration (e.g. one workspace per environment) without duplicating the code.' },
];

/** Terraform's core vocabulary -- click a term for what it actually
 * means. */
export default function TerraformCoreConceptsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('resource');
  const color = getConceptColor(t, 'attention');
  const c = CONCEPTS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={c.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {CONCEPTS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
