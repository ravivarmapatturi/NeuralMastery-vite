import { useState } from 'react';
import type { PracticeTestCase } from '../../lib/practiceProblem';
import type { ExecutionResult } from '../../lib/execution/types';
import type { SubmissionRecord } from '../../lib/practicePersistence';
import { useVizTokens } from '../../theme/vizTokens';

interface TestResultsPaneProps {
  testCases: PracticeTestCase[];
  customTestCases: PracticeTestCase[];
  onAddCustomTest: (input: Record<string, unknown>, expected?: unknown) => void;
  onRemoveCustomTest: (id: string) => void;
  result: ExecutionResult | null;
  lastAction: 'run' | 'submit' | null;
  submissions: SubmissionRecord[];
  onLoadSubmissionCode?: (code: string) => void;
}

export default function TestResultsPane({
  testCases,
  customTestCases,
  onAddCustomTest,
  onRemoveCustomTest,
  result,
  lastAction,
  submissions,
  onLoadSubmissionCode,
}: TestResultsPaneProps) {
  const t = useVizTokens();
  const [activeTab, setActiveTab] = useState<'examples' | 'custom' | 'console' | 'submissions'>('examples');
  const [newInputJson, setNewInputJson] = useState<string>('{\n  "a": [1, 2],\n  "b": [3, 4]\n}');
  const [newExpectedJson, setNewExpectedJson] = useState<string>('11');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const visibleTestCases = testCases.filter((tc) => !tc.hidden);
  const passedCount = result?.caseResults.filter((c) => c.passed).length ?? 0;
  const totalCount = result?.caseResults.length ?? 0;

  function handleCreateCustomTest() {
    try {
      const parsedInput = JSON.parse(newInputJson);
      const parsedExpected = newExpectedJson.trim() ? JSON.parse(newExpectedJson) : undefined;
      onAddCustomTest(parsedInput, parsedExpected);
      setShowAddForm(false);
    } catch (err) {
      alert(`Invalid JSON in custom test case input or expected output: ${(err as Error).message}`);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--nm-surface-alt, #020617)',
        border: '1px solid var(--nm-border, rgba(255,255,255,0.1))',
        borderRadius: 8,
        overflow: 'hidden',
        fontSize: 12.5,
      }}
    >
      {/* Header Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          borderBottom: '1px solid var(--nm-border, rgba(255,255,255,0.1))',
          background: 'rgba(15, 23, 42, 0.8)',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            style={tabStyle(activeTab === 'examples', t)}
          >
            Examples ({visibleTestCases.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            style={tabStyle(activeTab === 'custom', t)}
          >
            Custom ({customTestCases.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('console')}
            style={tabStyle(activeTab === 'console', t)}
          >
            Console / Results {result && `(${passedCount}/${totalCount})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            style={tabStyle(activeTab === 'submissions', t)}
          >
            Submissions ({submissions.length})
          </button>
        </div>

        {result && (
          <div style={{ fontSize: 12, fontWeight: 700 }}>
            {result.status === 'success' ? (
              <span style={{ color: '#34d399' }}>✓ {lastAction === 'submit' ? 'Submitted & Passed' : 'All Passed'}</span>
            ) : result.status === 'syntax_error' ? (
              <span style={{ color: '#ef4444' }}>⚠ Syntax Error</span>
            ) : result.status === 'runtime_error' ? (
              <span style={{ color: '#ef4444' }}>⚠ Runtime Error</span>
            ) : (
              <span style={{ color: '#f59e0b' }}>✕ Wrong Answer</span>
            )}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Tab 1: Examples */}
        {activeTab === 'examples' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {visibleTestCases.map((tc, idx) => {
                const caseResult = result?.caseResults.find((c) => c.testCaseId === tc.id);

                return (
                  <div
                    key={tc.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${
                        caseResult
                          ? caseResult.passed
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(239, 68, 68, 0.4)'
                          : 'rgba(255, 255, 255, 0.08)'
                      }`,
                      borderRadius: 8,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                        Case {idx + 1}: {tc.label}
                      </span>

                      {caseResult && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: caseResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: caseResult.passed ? '#34d399' : '#f87171',
                          }}
                        >
                          {caseResult.passed ? '✓ Passed' : '✕ Failed'}
                          {caseResult.executionTimeMs !== undefined && ` (${caseResult.executionTimeMs}ms)`}
                        </span>
                      )}
                    </div>

                    <div style={{ fontFamily: 'ui-monospace, monospace', color: '#cbd5e1' }}>
                      <span style={{ color: '#64748b' }}>Input: </span>
                      {JSON.stringify(tc.input)}
                    </div>

                    <div style={{ fontFamily: 'ui-monospace, monospace', color: '#cbd5e1' }}>
                      <span style={{ color: '#64748b' }}>Expected: </span>
                      {tc.expectError ? `Raises ${tc.expectError}` : JSON.stringify(tc.expectedOutput)}
                    </div>

                    {caseResult && (
                      <div style={{ fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>
                        <span style={{ color: '#64748b' }}>Actual: </span>
                        <span style={{ color: caseResult.passed ? '#34d399' : '#f87171' }}>
                          {JSON.stringify(caseResult.actualOutput)}
                        </span>
                      </div>
                    )}

                    {caseResult?.error && (
                      <pre style={{ margin: '4px 0 0', padding: 6, borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: 11, whiteSpace: 'pre-wrap' }}>
                        {caseResult.error}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Test Cases */}
        {activeTab === 'custom' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Create custom test cases to test custom inputs against your solution.</span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#818cf8',
                  cursor: 'pointer',
                }}
              >
                {showAddForm ? 'Cancel' : '+ Add Test Case'}
              </button>
            </div>

            {showAddForm && (
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>New Custom Test Case</div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Input JSON kwargs:</label>
                  <textarea
                    value={newInputJson}
                    onChange={(e) => setNewInputJson(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: '#020617',
                      color: '#38bdf8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4,
                      padding: 8,
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 12,
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Expected Output JSON:</label>
                  <input
                    type="text"
                    value={newExpectedJson}
                    onChange={(e) => setNewExpectedJson(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: '#020617',
                      color: '#34d399',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4,
                      padding: 8,
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 12,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateCustomTest}
                  style={{
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save Test Case
                </button>
              </div>
            )}

            {customTestCases.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic', padding: '12px 0' }}>No custom test cases added yet. Click "+ Add Test Case" above.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {customTestCases.map((tc, idx) => {
                  const caseResult = result?.caseResults.find((c) => c.testCaseId === tc.id);

                  return (
                    <div
                      key={tc.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>Custom Test {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveCustomTest(tc.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                        >
                          Delete
                        </button>
                      </div>

                      <div style={{ fontFamily: 'ui-monospace, monospace', color: '#cbd5e1' }}>
                        <span style={{ color: '#64748b' }}>Input: </span>
                        {JSON.stringify(tc.input)}
                      </div>

                      <div style={{ fontFamily: 'ui-monospace, monospace', color: '#cbd5e1' }}>
                        <span style={{ color: '#64748b' }}>Expected: </span>
                        {JSON.stringify(tc.expectedOutput)}
                      </div>

                      {caseResult && (
                        <div style={{ fontFamily: 'ui-monospace, monospace', marginTop: 4 }}>
                          <span style={{ color: '#64748b' }}>Actual: </span>
                          <span style={{ color: caseResult.passed ? '#34d399' : '#f87171' }}>{JSON.stringify(caseResult.actualOutput)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Console Output & Results */}
        {activeTab === 'console' && (
          <div>
            {result ? (
              <div>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: result.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${result.status === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: result.status === 'success' ? '#34d399' : '#f87171' }}>
                    {result.status === 'success'
                      ? `✓ ${lastAction === 'submit' ? 'Submission Accepted' : 'Execution Succeeded'}`
                      : result.status === 'syntax_error'
                        ? '✕ Syntax Error'
                        : result.status === 'runtime_error'
                          ? '✕ Runtime Error'
                          : '✕ Wrong Answer'}
                  </div>

                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Tests Passed: {passedCount} / {totalCount}
                    {result.totalExecutionTimeMs !== undefined && ` · Total Runtime: ${result.totalExecutionTimeMs}ms`}
                  </div>

                  {result.errorMessage && (
                    <pre style={{ marginTop: 8, padding: 8, borderRadius: 4, background: '#020617', color: '#f87171', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                      {result.errorMessage}
                    </pre>
                  )}
                </div>

                {result.stdout && (
                  <div>
                    <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }}>Stdout Console:</div>
                    <pre style={{ padding: 12, borderRadius: 6, background: '#020617', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 12, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap' }}>
                      {result.stdout}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>No execution results yet. Click "Run" or "Submit" to execute code.</div>
            )}
          </div>
        )}

        {/* Tab 4: Submissions History */}
        {activeTab === 'submissions' && (
          <div>
            {submissions.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>No submissions recorded yet. Click "Submit" after implementing your code.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: sub.status === 'success' ? '#34d399' : '#f87171',
                          }}
                        >
                          {sub.status === 'success' ? '✓ Accepted' : '✕ Wrong Answer'}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                          {sub.passedCount}/{sub.totalCount} tests passed
                        </span>
                        {sub.totalExecutionTimeMs !== undefined && (
                          <span style={{ fontSize: 12, color: '#64748b' }}>({sub.totalExecutionTimeMs}ms)</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Date(sub.timestamp).toLocaleString()}</div>
                    </div>

                    {onLoadSubmissionCode && (
                      <button
                        type="button"
                        onClick={() => onLoadSubmissionCode(sub.code)}
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: 4,
                          padding: '3px 8px',
                          fontSize: 11,
                          color: '#818cf8',
                          cursor: 'pointer',
                        }}
                      >
                        Load Code
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function tabStyle(active: boolean, t: ReturnType<typeof useVizTokens>) {
  return {
    background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
    border: `1px solid ${active ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    color: active ? '#818cf8' : t.textMuted,
    cursor: 'pointer',
  } as const;
}
