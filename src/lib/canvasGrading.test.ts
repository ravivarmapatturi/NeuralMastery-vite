import { describe, expect, it } from 'vitest';
import { gradeArchitecture, type ArchitectureGradeResult } from './canvasGrading';

describe('gradeArchitecture', () => {
  const correctNodes = [
    { id: 'node-reasoner', data: { componentType: 'reasoner' as const } },
    { id: 'node-tool', data: { componentType: 'tool' as const } },
    { id: 'node-memory', data: { componentType: 'memory' as const } },
    { id: 'node-database', data: { componentType: 'database' as const } },
    { id: 'node-final', data: { componentType: 'final_answer' as const } },
  ];

  const correctEdges = [
    // Reasoner <-> Tool bidirectional
    { id: 'e1', source: 'node-reasoner', target: 'node-tool' }, // action dispatch
    { id: 'e2', source: 'node-tool', target: 'node-reasoner' }, // observation return
    // Reasoner <-> Memory
    { id: 'e3', source: 'node-reasoner', target: 'node-memory' },
    // Memory <-> Database
    { id: 'e4', source: 'node-memory', target: 'node-database' },
    // Reasoner -> Final Answer
    { id: 'e5', source: 'node-reasoner', target: 'node-final' },
  ];

  it('verifies a fully correct ReAct topology', () => {
    const result: ArchitectureGradeResult = gradeArchitecture(correctNodes, correctEdges);
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(100);
    expect(result.passedCount).toBe(result.totalCount);
    expect(result.commonMistakeFeedback).toBeNull();
    expect(result.summary).toContain('Production ReAct agent topology verified');
  });

  it('detects and provides specific feedback for the direct Database-to-Reasoner mistake', () => {
    // Replace Memory <-> DB edge with direct DB -> Reasoner edge
    const buggyEdges = [
      { id: 'e1', source: 'node-reasoner', target: 'node-tool' },
      { id: 'e2', source: 'node-tool', target: 'node-reasoner' },
      { id: 'e3', source: 'node-reasoner', target: 'node-memory' },
      { id: 'e4-bug', source: 'node-database', target: 'node-reasoner' }, // DIRECT DB TO REASONER!
      { id: 'e5', source: 'node-reasoner', target: 'node-final' },
    ];

    const result = gradeArchitecture(correctNodes, buggyEdges);
    expect(result.isCorrect).toBe(false);
    expect(result.commonMistakeFeedback).toContain('Direct Database Connection Detected');
    expect(result.commonMistakeFeedback).toContain('LangGraph persistent checkpointers');
    expect(result.items.find((i) => i.id === 'db-isolation')?.passed).toBe(false);
    expect(result.items.find((i) => i.id === 'db-connection')?.passed).toBe(false);
  });

  it('detects missing observation return in Tool loop (one-way Reasoner -> Tool only)', () => {
    const missingObsEdges = [
      { id: 'e1', source: 'node-reasoner', target: 'node-tool' }, // only action
      { id: 'e3', source: 'node-reasoner', target: 'node-memory' },
      { id: 'e4', source: 'node-memory', target: 'node-database' },
      { id: 'e5', source: 'node-reasoner', target: 'node-final' },
    ];

    const result = gradeArchitecture(correctNodes, missingObsEdges);
    expect(result.isCorrect).toBe(false);
    const toolItem = result.items.find((i) => i.id === 'tool-loop');
    expect(toolItem?.passed).toBe(false);
    expect(toolItem?.message).toContain('observation return path is missing');
  });

  it('detects missing action dispatch in Tool loop (one-way Tool -> Reasoner only)', () => {
    const missingActionEdges = [
      { id: 'e2', source: 'node-tool', target: 'node-reasoner' }, // only observation
      { id: 'e3', source: 'node-reasoner', target: 'node-memory' },
      { id: 'e4', source: 'node-memory', target: 'node-database' },
      { id: 'e5', source: 'node-reasoner', target: 'node-final' },
    ];

    const result = gradeArchitecture(correctNodes, missingActionEdges);
    expect(result.isCorrect).toBe(false);
    const toolItem = result.items.find((i) => i.id === 'tool-loop');
    expect(toolItem?.passed).toBe(false);
    expect(toolItem?.message).toContain('action dispatch is missing');
  });

  it('detects disconnected Memory node', () => {
    const disconnectedMemoryEdges = [
      { id: 'e1', source: 'node-reasoner', target: 'node-tool' },
      { id: 'e2', source: 'node-tool', target: 'node-reasoner' },
      { id: 'e4', source: 'node-memory', target: 'node-database' },
      { id: 'e5', source: 'node-reasoner', target: 'node-final' },
    ];

    const result = gradeArchitecture(correctNodes, disconnectedMemoryEdges);
    expect(result.isCorrect).toBe(false);
    const memItem = result.items.find((i) => i.id === 'memory-connection');
    expect(memItem?.passed).toBe(false);
    expect(memItem?.message).toContain('Memory / Context Store must be connected to the Reasoner');
  });

  it('detects reversed Final Answer connection', () => {
    const reversedFinalEdges = [
      { id: 'e1', source: 'node-reasoner', target: 'node-tool' },
      { id: 'e2', source: 'node-tool', target: 'node-reasoner' },
      { id: 'e3', source: 'node-reasoner', target: 'node-memory' },
      { id: 'e4', source: 'node-memory', target: 'node-database' },
      { id: 'e5-rev', source: 'node-final', target: 'node-reasoner' }, // Final Answer -> Reasoner
    ];

    const result = gradeArchitecture(correctNodes, reversedFinalEdges);
    expect(result.isCorrect).toBe(false);
    const finalItem = result.items.find((i) => i.id === 'final-answer');
    expect(finalItem?.passed).toBe(false);
    expect(finalItem?.message).toContain('direction is reversed');
  });

  it('flags missing Reasoner hub', () => {
    const noReasonerNodes = correctNodes.filter((n) => n.id !== 'node-reasoner');
    const result = gradeArchitecture(noReasonerNodes, []);
    expect(result.isCorrect).toBe(false);
    expect(result.items.find((i) => i.id === 'hub')?.passed).toBe(false);
  });

  it('flags multiple Reasoners when more than one is present', () => {
    const multiReasonerNodes = [
      ...correctNodes,
      { id: 'node-reasoner-2', data: { componentType: 'reasoner' as const } },
    ];
    const result = gradeArchitecture(multiReasonerNodes, correctEdges);
    expect(result.isCorrect).toBe(false);
    expect(result.items.find((i) => i.id === 'hub')?.message).toContain('Multiple Reasoners detected');
  });

  it('works with node.type fallback when data.componentType is not set', () => {
    const typeBasedNodes = [
      { id: 'node-reasoner', type: 'reasoner' },
      { id: 'node-tool', type: 'tool' },
      { id: 'node-memory', type: 'memory' },
      { id: 'node-database', type: 'database' },
      { id: 'node-final', type: 'final_answer' },
    ];
    const result = gradeArchitecture(typeBasedNodes, correctEdges);
    expect(result.isCorrect).toBe(true);
  });
});
