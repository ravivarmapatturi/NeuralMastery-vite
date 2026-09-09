import type { CanvasNodeType } from './practiceProblem';

export interface ArchitectureCheckItem {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface ArchitectureGradeResult {
  isCorrect: boolean;
  score: number;
  passedCount: number;
  totalCount: number;
  summary: string;
  items: ArchitectureCheckItem[];
  commonMistakeFeedback: string | null;
}

interface GenericNode {
  id: string;
  type?: string;
  data?: {
    componentType?: CanvasNodeType;
    [key: string]: unknown;
  };
}

interface GenericEdge {
  id: string;
  source: string;
  target: string;
}

/** Extracts the component type from either data.componentType or node.type */
export function getComponentType(node: GenericNode): CanvasNodeType | undefined {
  if (node.data?.componentType) {
    return node.data.componentType;
  }
  if (
    node.type === 'reasoner' ||
    node.type === 'tool' ||
    node.type === 'memory' ||
    node.type === 'database' ||
    node.type === 'final_answer'
  ) {
    return node.type as CanvasNodeType;
  }
  return undefined;
}

/**
 * Grades a user's Canvas ReAct agent topology against the reference architecture:
 *
 * User Query -> [Reasoner (LLM)] <-> [Tool Router] -> one of: [Search / Calc / DB Tools]
 *                     ^                                             |
 *                     |------------------ Observation ------------- <-+
 *                     |
 *               [Memory / Context Store] <-> [Database] (persistence for memory across sessions)
 *                     |
 *                     v
 *               [Final Answer] (loop-exit condition)
 */
export function gradeArchitecture(nodes: GenericNode[], edges: GenericEdge[]): ArchitectureGradeResult {
  const items: ArchitectureCheckItem[] = [];
  let commonMistakeFeedback: string | null = null;

  // Group nodes by component type
  const reasonerNodes = nodes.filter((n) => getComponentType(n) === 'reasoner');
  const toolNodes = nodes.filter((n) => getComponentType(n) === 'tool');
  const memoryNodes = nodes.filter((n) => getComponentType(n) === 'memory');
  const dbNodes = nodes.filter((n) => getComponentType(n) === 'database');
  const finalNodes = nodes.filter((n) => getComponentType(n) === 'final_answer');

  const reasonerIds = new Set(reasonerNodes.map((n) => n.id));
  const toolIds = new Set(toolNodes.map((n) => n.id));
  const memoryIds = new Set(memoryNodes.map((n) => n.id));
  const dbIds = new Set(dbNodes.map((n) => n.id));
  const finalIds = new Set(finalNodes.map((n) => n.id));

  // 1. Reasoner Hub Check (exactly one hub)
  if (reasonerNodes.length === 0) {
    items.push({
      id: 'hub',
      label: 'LLM Reasoner Hub',
      passed: false,
      message: 'Missing Reasoner hub. Add an LLM Reasoner node to act as the central reasoning core.',
    });
  } else if (reasonerNodes.length > 1) {
    items.push({
      id: 'hub',
      label: 'LLM Reasoner Hub',
      passed: false,
      message: 'Multiple Reasoners detected. A ReAct agent requires exactly one central LLM Reasoner hub.',
    });
  } else {
    items.push({
      id: 'hub',
      label: 'LLM Reasoner Hub',
      passed: true,
      message: 'Single LLM Reasoner hub present.',
    });
  }

  const mainReasoner = reasonerNodes.length === 1 ? reasonerNodes[0] : null;

  // 2. Direct DB-to-Reasoner Common Mistake Detection
  // Common production pitfall: querying DB directly from Reasoner without going through Memory
  const hasDirectDbEdge = edges.some(
    (e) =>
      (dbIds.has(e.source) && reasonerIds.has(e.target)) ||
      (reasonerIds.has(e.source) && dbIds.has(e.target)),
  );

  if (hasDirectDbEdge) {
    commonMistakeFeedback =
      'Direct Database Connection Detected: In production ReAct architectures (such as LangGraph persistent checkpointers), the LLM Reasoner should not directly query the Database. Persistence must flow through the Memory/Context Store to maintain state consistency across sessions.';
    items.push({
      id: 'db-isolation',
      label: 'Database Isolation (via Memory)',
      passed: false,
      message:
        'Direct connection between Database and Reasoner detected. Route database persistence through the Memory / Context Store instead.',
    });
  } else {
    items.push({
      id: 'db-isolation',
      label: 'Database Isolation (via Memory)',
      passed: true,
      message: 'Database is correctly decoupled from direct raw Reasoner access.',
    });
  }

  // 3. Bidirectional Tool Loop Check (Action out, Observation in)
  if (toolNodes.length === 0) {
    items.push({
      id: 'tool-loop',
      label: 'Bidirectional Tool Loop',
      passed: false,
      message:
        'No Tool node present on canvas. Add a Tool Router node to allow the agent to execute actions and receive observations.',
    });
  } else if (mainReasoner) {
    // Check if at least one tool node has bidirectional connection with the reasoner
    const validTools = toolNodes.filter((tool) => {
      const hasAction = edges.some((e) => e.source === mainReasoner.id && e.target === tool.id);
      const hasObs = edges.some((e) => e.source === tool.id && e.target === mainReasoner.id);
      return hasAction && hasObs;
    });

    if (validTools.length > 0) {
      items.push({
        id: 'tool-loop',
        label: 'Bidirectional Tool Loop',
        passed: true,
        message:
          'Bidirectional connection verified: Reasoner dispatches actions to Tool, and Tool streams Observations back to Reasoner.',
      });
    } else {
      // Check partial states for helpful specific feedback
      const hasAnyAction = edges.some((e) => reasonerIds.has(e.source) && toolIds.has(e.target));
      const hasAnyObs = edges.some((e) => toolIds.has(e.source) && reasonerIds.has(e.target));

      if (hasAnyAction && !hasAnyObs) {
        items.push({
          id: 'tool-loop',
          label: 'Bidirectional Tool Loop',
          passed: false,
          message:
            'Action dispatch is connected (Reasoner → Tool), but the observation return path is missing. The Tool must connect back to the Reasoner (Tool → Reasoner) to return Observations.',
        });
      } else if (!hasAnyAction && hasAnyObs) {
        items.push({
          id: 'tool-loop',
          label: 'Bidirectional Tool Loop',
          passed: false,
          message:
            'Observation return is connected (Tool → Reasoner), but action dispatch is missing. The Reasoner must connect to the Tool (Reasoner → Tool) to dispatch tool executions.',
        });
      } else {
        items.push({
          id: 'tool-loop',
          label: 'Bidirectional Tool Loop',
          passed: false,
          message:
            'Tool is not connected to Reasoner. ReAct requires bidirectional edges between Reasoner and Tool (Action out, Observation in).',
        });
      }
    }
  } else {
    items.push({
      id: 'tool-loop',
      label: 'Bidirectional Tool Loop',
      passed: false,
      message: 'Tool loop requires a single central Reasoner node.',
    });
  }

  // 4. Memory / Context Store Connection Check
  if (memoryNodes.length === 0) {
    items.push({
      id: 'memory-connection',
      label: 'Memory / Context Store',
      passed: false,
      message:
        'No Memory node present. Add a Memory / Context Store node to buffer conversational history and scratchpad thoughts.',
    });
  } else if (mainReasoner) {
    const isMemoryConnected = edges.some(
      (e) =>
        (e.source === mainReasoner.id && memoryIds.has(e.target)) ||
        (memoryIds.has(e.source) && e.target === mainReasoner.id),
    );

    if (isMemoryConnected) {
      items.push({
        id: 'memory-connection',
        label: 'Memory / Context Store',
        passed: true,
        message: 'Memory / Context Store is connected to the Reasoner for state buffering.',
      });
    } else {
      items.push({
        id: 'memory-connection',
        label: 'Memory / Context Store',
        passed: false,
        message:
          'Memory / Context Store must be connected to the Reasoner to supply and store conversation state across loop iterations.',
      });
    }
  } else {
    items.push({
      id: 'memory-connection',
      label: 'Memory / Context Store',
      passed: false,
      message: 'Memory connection requires a single central Reasoner node.',
    });
  }

  // 5. Database Connection Check (connected to Memory, NOT Reasoner)
  if (dbNodes.length === 0) {
    items.push({
      id: 'db-connection',
      label: 'Database Persistence',
      passed: false,
      message: 'No Database node present. Add a Database node for cross-session checkpoint persistence.',
    });
  } else {
    const isDbConnectedToMemory = edges.some(
      (e) =>
        (dbIds.has(e.source) && memoryIds.has(e.target)) ||
        (memoryIds.has(e.source) && dbIds.has(e.target)),
    );

    if (isDbConnectedToMemory) {
      items.push({
        id: 'db-connection',
        label: 'Database Persistence',
        passed: true,
        message: 'Database is connected to Memory / Context Store for session persistence.',
      });
    } else {
      items.push({
        id: 'db-connection',
        label: 'Database Persistence',
        passed: false,
        message:
          'Database must connect to the Memory / Context Store (not Reasoner) to persist checkpoints across sessions.',
      });
    }
  }

  // 6. Final Answer / Loop-Exit Termination Check (Reasoner -> Final Answer)
  if (finalNodes.length === 0) {
    items.push({
      id: 'final-answer',
      label: 'Loop-Exit Termination',
      passed: false,
      message: 'No Final Answer node present. Add a Final Answer node representing the exit condition.',
    });
  } else if (mainReasoner) {
    const hasFinalExit = edges.some((e) => e.source === mainReasoner.id && finalIds.has(e.target));
    const hasReversedExit = edges.some((e) => finalIds.has(e.source) && e.target === mainReasoner.id);

    if (hasFinalExit) {
      items.push({
        id: 'final-answer',
        label: 'Loop-Exit Termination',
        passed: true,
        message: 'Final Answer node is correctly connected from Reasoner as the loop-exit condition.',
      });
    } else if (hasReversedExit) {
      items.push({
        id: 'final-answer',
        label: 'Loop-Exit Termination',
        passed: false,
        message:
          'Edge direction is reversed: Reasoner must connect to Final Answer (Reasoner → Final Answer), not Final Answer into Reasoner.',
      });
    } else {
      items.push({
        id: 'final-answer',
        label: 'Loop-Exit Termination',
        passed: false,
        message:
          'Final Answer node must be connected from the Reasoner (Reasoner → Final Answer) to signal loop completion.',
      });
    }
  } else {
    items.push({
      id: 'final-answer',
      label: 'Loop-Exit Termination',
      passed: false,
      message: 'Final Answer exit requires a single central Reasoner node.',
    });
  }

  const passedCount = items.filter((i) => i.passed).length;
  const totalCount = items.length;
  const isCorrect = passedCount === totalCount && commonMistakeFeedback === null;
  const score = Math.round((passedCount / totalCount) * 100);

  let summary = '';
  if (isCorrect) {
    summary =
      'Production ReAct agent topology verified! Central Reasoner hub, bidirectional Tool loop, Memory store, Database persistence, and Final Answer exit are all correctly wired.';
  } else if (commonMistakeFeedback) {
    summary = 'Architecture validation failed: Anti-pattern detected (direct Reasoner-to-Database coupling).';
  } else {
    summary = `${passedCount} of ${totalCount} architecture rules satisfied. Review feedback items below.`;
  }

  return {
    isCorrect,
    score,
    passedCount,
    totalCount,
    summary,
    items,
    commonMistakeFeedback,
  };
}
