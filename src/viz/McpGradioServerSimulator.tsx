import { useState } from 'react';
import VisualizationContainer from './primitives/VisualizationContainer';
import VisualizationHeader from './primitives/VisualizationHeader';

export default function McpGradioServerSimulator() {
  const [inputText, setInputText] = useState('Neural Mastery makes learning AI fast and interactive!');
  const [isRunning, setIsRunning] = useState(false);
  const [outputResult, setOutputResult] = useState<any | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const lower = inputText.toLowerCase();
      const polarity = lower.includes('great') || lower.includes('awesome') || lower.includes('amazing') || lower.includes('fast') ? 0.85 : lower.includes('bad') || lower.includes('slow') ? -0.75 : 0.1;
      setOutputResult({
        polarity: polarity,
        subjectivity: 0.65,
        assessment: polarity > 0.2 ? 'positive' : polarity < -0.2 ? 'negative' : 'neutral'
      });
      setIsRunning(false);
    }, 600);
  };

  return (
    <VisualizationContainer>
      <VisualizationHeader
        title="Live Gradio & FastMCP Server Execution Sandbox"
        description="Test live Python function execution, Gradio Web UI preview, and automatic MCP JSON-RPC tool schema generation."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Server Code Panel */}
        <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Python Server (app.py)</span>
            <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', border: '1px solid #10b981' }}>mcp_server=True</span>
          </div>

          <pre style={{ margin: 0, padding: '12px', background: '#030712', borderRadius: '8px', color: '#cbd5e1', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid #1e293b' }}>
{`import gradio as gr
from textblob import TextBlob

def sentiment_analysis(text: str) -> str:
    blob = TextBlob(text)
    return {
        "polarity": blob.sentiment.polarity,
        "assessment": "positive" if blob.sentiment.polarity > 0 else "neutral"
    }

demo = gr.Interface(
    fn=sentiment_analysis,
    inputs=gr.Textbox(),
    outputs=gr.JSON()
)

demo.launch(mcp_server=True)`}
          </pre>
        </div>

        {/* Live Client Execution Panel */}
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px' }}>
            Interactive Client Request Sandbox
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Input Text Parameter:</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#f8fafc', fontSize: '13px' }}
            />
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            {isRunning ? 'Executing MCP Tool Call...' : 'Execute MCP Tool Call (tools/call)'}
          </button>

          {outputResult && (
            <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>
                MCP Content Result Payload
              </div>
              <pre style={{ margin: 0, color: '#38bdf8', fontSize: '11px', fontFamily: 'monospace' }}>
                {JSON.stringify({
                  content: [
                    { type: "text", text: JSON.stringify(outputResult) }
                  ],
                  isError: false
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}
