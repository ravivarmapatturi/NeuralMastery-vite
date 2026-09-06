import { useState } from 'react';
import VisualizationContainer from './primitives/VisualizationContainer';

const BUILD_STEPS = [
  {
    step: 1,
    title: 'Step 1 — Define Python Tool Function',
    code: `@mcp.tool()
def get_weather(city: str) -> str:
    """Returns weather temperature for a city."""
    return f"Weather in {city}: 72°F Sunny"`,
    explanation: 'Decorator @mcp.tool() registers Python function as an executable tool. Docstrings & type hints define arguments.'
  },
  {
    step: 2,
    title: 'Step 2 — MCP Automatically Generates JSON Schema',
    code: `{
  "name": "get_weather",
  "description": "Returns weather temperature for a city.",
  "inputSchema": {
    "type": "object",
    "properties": { "city": { "type": "string" } },
    "required": ["city"]
  }
}`,
    explanation: 'FastMCP parses type annotations `city: str` and converts them into standard JSON Schema input definitions.'
  },
  {
    step: 3,
    title: 'Step 3 — Client Discovers Tool (tools/list)',
    code: `CLIENT -> {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
SERVER -> {"result": {"tools": [{"name": "get_weather", ...}]}}`,
    explanation: 'Upon session initialization, the client calls `tools/list` to inspect available tools on the server.'
  },
  {
    step: 4,
    title: 'Step 4 — Agent Calls Tool (tools/call)',
    code: `CLIENT -> {
  "jsonrpc": "2.0", "id": 2, "method": "tools/call",
  "params": { "name": "get_weather", "arguments": { "city": "Tokyo" } }
}`,
    explanation: 'The LLM agent generates structured arguments matching the discovered schema and sends `tools/call`.'
  },
  {
    step: 5,
    title: 'Step 5 — Server Executes Function',
    code: `Python Runtime -> get_weather(city="Tokyo")
Output -> "Weather in Tokyo: 72°F Sunny"`,
    explanation: 'The MCP Server validates arguments, invokes Python `get_weather("Tokyo")`, and captures return string.'
  },
  {
    step: 6,
    title: 'Step 6 — Result Returns to Agent Context',
    code: `SERVER -> {
  "jsonrpc": "2.0", "id": 2,
  "result": { "content": [{"type": "text", "text": "Weather in Tokyo: 72°F Sunny"}] }
}`,
    explanation: 'The result is packaged into standard MCP content array format and returned into the LLM context loop.'
  }
];

export default function McpServerBuildProgression() {
  const [activeStep, setActiveStep] = useState(0);

  const current = BUILD_STEPS[activeStep];

  return (
    <VisualizationContainer>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
        Interactive Server Construction
      </div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc', fontWeight: 800 }}>
        Visual Step-by-Step Server Execution Progression
      </h3>

      {/* Stepper Buttons */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {BUILD_STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: i === activeStep ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              background: i === activeStep ? 'rgba(16, 185, 129, 0.15)' : '#090d16',
              color: i === activeStep ? '#34d399' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Step {i + 1}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '16px', borderRadius: '12px', background: '#090d16', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#f8fafc', fontWeight: 800 }}>
          {current.title}
        </h4>
        <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#cbd5e1' }}>
          {current.explanation}
        </p>

        <pre style={{ margin: 0, padding: '12px', background: '#020617', borderRadius: '8px', color: '#38bdf8', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid #1e293b' }}>
          {current.code}
        </pre>
      </div>
    </VisualizationContainer>
  );
}
