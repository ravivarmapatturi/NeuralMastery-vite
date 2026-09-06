import VisualizationContainer from './primitives/VisualizationContainer';
import VisualizationHeader from './primitives/VisualizationHeader';
import VisualizationStepController, { useStepController } from './primitives/VisualizationStepController';

const MCP_STEPS = [
  {
    step: 1,
    title: '1. User Prompt Input',
    actor: 'User → Host',
    description: 'User enters prompt "Find active users in Postgres and write a postmortem report" in Claude Desktop or Cursor IDE.',
    payload: {
      userInput: "Find active users in Postgres and write a postmortem report",
      hostApp: "Claude Desktop v1.2"
    }
  },
  {
    step: 2,
    title: '2. LLM Reasoning & Tool Selection',
    actor: 'Host (LLM)',
    description: 'The Host evaluates context using the LLM and determines it needs the `query_database` tool from an external MCP server.',
    payload: {
      llmDecision: "Invoke tool query_database",
      targetServer: "Postgres-MCP-Server"
    }
  },
  {
    step: 3,
    title: '3. Handshake Initialization Request',
    actor: 'Client → Server',
    description: 'The Host\'s MCP Client sends an `initialize` JSON-RPC request to negotiate protocol version and client capabilities.',
    payload: {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: { roots: { listChanged: true } },
        clientInfo: { name: "ClaudeDesktop", version: "1.2.0" }
      }
    }
  },
  {
    step: 4,
    title: '4. Capability Discovery Response',
    actor: 'Server → Client',
    description: 'The MCP Server acknowledges initialization and exposes its supported capabilities (tools list schema).',
    payload: {
      jsonrpc: "2.0",
      id: 1,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "postgres-mcp", version: "2.1.0" }
      }
    }
  },
  {
    step: 5,
    title: '5. Tool Call Execution Payload',
    actor: 'Client → Server',
    description: 'The Client dispatches `tools/call` containing validated JSON arguments for executing the database query.',
    payload: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "query_database",
        arguments: { sql: "SELECT count(*) FROM users WHERE active = true;" }
      }
    }
  },
  {
    step: 6,
    title: '6. Server Execution & Content Delivery',
    actor: 'Server → Client',
    description: 'The MCP Server executes the SQL query safely and wraps the output in the standard MCP `content` array format.',
    payload: {
      jsonrpc: "2.0",
      id: 2,
      result: {
        content: [
          { type: "text", text: "Active User Count: 14,208" }
        ],
        isError: false
      }
    }
  },
  {
    step: 7,
    title: '7. Context Integration & Final Response',
    actor: 'Host → User',
    description: 'The Client feeds the tool output back into the LLM context to construct the final response for the user.',
    payload: {
      finalResponse: "There are currently 14,208 active users in the database.",
      status: "Task Completed Successfully"
    }
  }
];

export default function McpProtocolMessageInspector() {
  const controller = useStepController(MCP_STEPS.length);
  const currentStep = MCP_STEPS[controller.step];

  return (
    <VisualizationContainer>
      <VisualizationHeader
        title="Interactive MCP 7-Step Protocol Inspector & Wire Frame Step-Through"
        description="Step through the exact JSON-RPC 2.0 messages exchanged between Host, Client, and Server during a complete MCP lifecycle."
      />

      <VisualizationStepController
        controller={controller}
        totalSteps={MCP_STEPS.length}
      />

      <div style={{ margin: '16px 0', padding: '16px', borderRadius: '12px', background: '#090d16', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>
            {currentStep.title}
          </h4>
          <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', fontWeight: 700 }}>
            {currentStep.actor}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
          {currentStep.description}
        </p>
      </div>

      <div style={{ background: '#030712', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Wire JSON Payload (Step {currentStep.step} / 7)</span>
          <span style={{ color: '#64748b' }}>JSON-RPC 2.0</span>
        </div>
        <pre style={{ margin: 0, padding: '12px', background: '#0b0f19', borderRadius: '8px', color: '#38bdf8', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid #1e293b' }}>
          {JSON.stringify(currentStep.payload, null, 2)}
        </pre>
      </div>
    </VisualizationContainer>
  );
}
