import { useState } from 'react';
import VisualizationContainer from './primitives/VisualizationContainer';
import VisualizationHeader from './primitives/VisualizationHeader';
import { Slider } from './primitives/VisualizationControls';

export default function McpMxNInteractiveSimulator() {
  const [numApps, setNumApps] = useState(4);
  const [numTools, setNumTools] = useState(5);
  const [mode, setMode] = useState<'without' | 'with'>('with');

  const mxnConnections = numApps * numTools;
  const mpnConnections = numApps + numTools;
  const savings = Math.round(((mxnConnections - mpnConnections) / mxnConnections) * 100);

  return (
    <VisualizationContainer>
      <VisualizationHeader
        title="Interactive M×N vs. M+N Integration Simulator"
        description="Dynamically adjust AI Applications (M) and External Tools (N) to visualize how MCP turns exponential complexity into linear scalability."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <Slider label="AI Applications (M)" min={1} max={8} value={numApps} onChange={setNumApps} />
        </div>

        <div>
          <Slider label="External Tools & Data (N)" min={1} max={10} value={numTools} onChange={setNumTools} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>
            Architecture Protocol Mode
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setMode('without')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: mode === 'without' ? '#ef4444' : 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Without MCP (M×N)
            </button>
            <button
              onClick={() => setMode('with')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: mode === 'with' ? '#0284c7' : 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              With MCP (M+N)
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Mode</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: mode === 'without' ? '#ef4444' : '#10b981' }}>
            {mode === 'without' ? 'Custom Glue Code' : 'MCP USB-C Standard'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Total Integrations</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
            {mode === 'without' ? mxnConnections : mpnConnections}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Integration Formula</div>
          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: mode === 'without' ? '#f43f5e' : '#38bdf8' }}>
            {mode === 'without' ? `${numApps} × ${numTools} = ${mxnConnections}` : `${numApps} + ${numTools} = ${mpnConnections}`}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Complexity Reduction</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
            {savings > 0 ? `-${savings}% Lines of Code` : 'Baseline'}
          </div>
        </div>
      </div>

      {/* Visual Canvas */}
      <div style={{ position: 'relative', height: '280px', borderRadius: '12px', background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden', padding: '16px' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {mode === 'without' ? (
            Array.from({ length: numApps }).flatMap((_, i) =>
              Array.from({ length: numTools }).map((_, j) => {
                const y1 = 40 + i * (200 / Math.max(1, numApps - 1 || 1));
                const y2 = 40 + j * (200 / Math.max(1, numTools - 1 || 1));
                return (
                  <line
                    key={`line-${i}-${j}`}
                    x1="120"
                    y1={y1}
                    x2="calc(100% - 120px)"
                    y2={y2}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    strokeDasharray="4 2"
                  />
                );
              })
            )
          ) : (
            <>
              {Array.from({ length: numApps }).map((_, i) => {
                const y1 = 40 + i * (200 / Math.max(1, numApps - 1 || 1));
                return (
                  <line
                    key={`app-hub-${i}`}
                    x1="120"
                    y1={y1}
                    x2="50%"
                    y2="140"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeOpacity="0.7"
                  />
                );
              })}
              {Array.from({ length: numTools }).map((_, j) => {
                const y2 = 40 + j * (200 / Math.max(1, numTools - 1 || 1));
                return (
                  <line
                    key={`hub-tool-${j}`}
                    x1="50%"
                    y1="140"
                    x2="calc(100% - 120px)"
                    y2={y2}
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeOpacity="0.7"
                  />
                );
              })}
            </>
          )}
        </svg>

        {/* Apps Column */}
        <div style={{ position: 'absolute', left: '16px', top: '16px', bottom: '16px', width: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {Array.from({ length: numApps }).map((_, i) => (
            <div
              key={`app-${i}`}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.2)',
                zIndex: 2,
              }}
            >
              App {i + 1}
            </div>
          ))}
        </div>

        {/* MCP Hub */}
        {mode === 'with' && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '130px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #7e22ce 100%)',
              border: '2px solid #f8fafc',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 0 25px rgba(168, 85, 247, 0.5)',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>Standard</div>
            <div style={{ fontSize: '13px', fontWeight: 800 }}>MCP Hub</div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>JSON-RPC 2.0</div>
          </div>
        )}

        {/* Tools Column */}
        <div style={{ position: 'absolute', right: '16px', top: '16px', bottom: '16px', width: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {Array.from({ length: numTools }).map((_, j) => (
            <div
              key={`tool-${j}`}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid #a855f7',
                color: '#c084fc',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)',
                zIndex: 2,
              }}
            >
              Tool {j + 1}
            </div>
          ))}
        </div>
      </div>
    </VisualizationContainer>
  );
}
