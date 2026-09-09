import { describe, it, expect } from 'vitest';
import { validateStepCode, assembleGuidedCode, getGuidedScaffold } from './guidedValidation';
import { getPracticeProblem } from './practiceProblem';

describe('guidedValidation logic', () => {
  const problem = getPracticeProblem('react-agent-loop')!;
  const steps = problem.guidedSteps!;

  it('verifies react-agent-loop has exactly 5 real guided steps', () => {
    expect(steps).toBeDefined();
    expect(steps.length).toBe(5);
    steps.forEach((s, idx) => {
      expect(s.title).toContain(`Step ${idx + 1}`);
      expect(s.prompt.length).toBeGreaterThan(20);
      expect(s.code.length).toBeGreaterThan(20);
    });
  });

  it('validates Step 1 correctly', () => {
    const valid = 'if "Final Answer:" in agent_output:\n    return {"status": "finished", "final_answer": "42", "observation": None}';
    expect(validateStepCode(0, valid).valid).toBe(true);

    const invalid = 'print("hello world")';
    expect(validateStepCode(0, invalid).valid).toBe(false);
  });

  it('validates Step 2 correctly', () => {
    const valid = 'action_match = re.search(r"Action:\\s*([^\\n]+)", agent_output)\ninput_match = re.search(r"Action Input:\\s*([^\\n]+)", agent_output)\nif not action_match:\n    return {"status": "error"}';
    expect(validateStepCode(1, valid).valid).toBe(true);

    const invalid = 'action = "search"';
    expect(validateStepCode(1, invalid).valid).toBe(false);
  });

  it('validates Step 3 correctly', () => {
    const valid = 'if action not in available_tools:\n    return {"status": "error", "observation": "not found"}';
    expect(validateStepCode(2, valid).valid).toBe(true);

    const invalid = 'action = available_tools.keys()';
    expect(validateStepCode(2, invalid).valid).toBe(false);
  });

  it('validates Step 4 correctly', () => {
    const valid = 'try:\n    tool_fn = available_tools[action]\n    result = tool_fn(action_input)\nexcept Exception as e:\n    return {"status": "error"}';
    expect(validateStepCode(3, valid).valid).toBe(true);

    const invalid = 'result = tool_fn(action_input)';
    expect(validateStepCode(3, invalid).valid).toBe(false);
  });

  it('validates Step 5 correctly', () => {
    const valid = 'return {"status": "continue", "observation": f"Observation: {result}"}';
    expect(validateStepCode(4, valid).valid).toBe(true);

    const invalid = 'return result';
    expect(validateStepCode(4, invalid).valid).toBe(false);
  });

  it('rejects empty or comment-only code', () => {
    expect(validateStepCode(0, '').valid).toBe(false);
    expect(validateStepCode(0, '   # just a comment\n# another comment').valid).toBe(false);
  });

  it('assembles the 5 fragments into the complete reference solution', () => {
    const fullCode = assembleGuidedCode(steps, 4);
    expect(fullCode).toContain('def react_agent_step(agent_output, available_tools):');
    expect(fullCode).toContain('if "Final Answer:" in agent_output:');
    expect(fullCode).toContain('action_match = re.search(');
    expect(fullCode).toContain('if action not in available_tools:');
    expect(fullCode).toContain('tool_fn = available_tools[action]');
    expect(fullCode).toContain('return {"status": "continue", "observation": f"Observation: {result}"}');
  });

  it('generates scaffold for step 0 and intermediate steps', () => {
    const step0Scaffold = getGuidedScaffold(steps, 0);
    expect(step0Scaffold).toContain('def react_agent_step(agent_output, available_tools):');
    expect(step0Scaffold).toContain('Final Answer:');

    const step2Scaffold = getGuidedScaffold(steps, 2);
    expect(step2Scaffold).toContain('Final Answer:');
    expect(step2Scaffold).toContain('action_match = re.search(');
  });
});
