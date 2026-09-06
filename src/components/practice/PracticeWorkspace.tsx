import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProblemPanel from './ProblemPanel';
import CodeEditorPane from './CodeEditorPane';
import TestResultsPane from './TestResultsPane';
import { getPracticeProblem, type PracticeTestCase } from '../../lib/practiceProblem';
import {
  loadSavedCode,
  saveUserCode,
  loadCustomTestCases,
  saveCustomTestCases,
  loadSubmissions,
  recordSubmission,
  loadLayoutSplit,
  saveLayoutSplit,
  type SubmissionRecord,
} from '../../lib/practicePersistence';
import { PyodideExecutor } from '../../lib/execution/pyodideExecutor';
import { ServerExecutor } from '../../lib/execution/serverExecutor';
import type { CodeExecutor, ExecutionResult } from '../../lib/execution/types';
import AuthButton from '../layout/AuthButton';
import StreakBadge from '../layout/StreakBadge';
import { useGamification } from '../../contexts/GamificationContext';
import { normalizeRoute, getFlatPages, getPageByRoute, getPracticeProblems } from '../../lib/contentTree';
import { isSolved, recommendedProblem, relatedLesson } from '../../lib/mastery';

interface PracticeWorkspaceProps {
  problemId: string;
  mdxContent?: React.ReactNode;
}

export default function PracticeWorkspace({ problemId, mdxContent }: PracticeWorkspaceProps) {
  const problem = getPracticeProblem(problemId);
  const location = useLocation();
  const permalink = normalizeRoute(location.pathname);
  const { events, awardProblemCompleted } = useGamification();

  // Layout splitters state
  const initialSplit = loadLayoutSplit();
  const [leftWidthPct, setLeftWidthPct] = useState<number>(initialSplit.leftWidthPct);
  const [topHeightPct, setTopHeightPct] = useState<number>(initialSplit.topHeightPct);

  // Focus Modes
  const [focusMode, setFocusMode] = useState<'normal' | 'problem' | 'editor' | 'results'>('normal');

  // Code & Persistence state
  const starterCode = problem?.starterCode ?? '';
  const [code, setCode] = useState<string>(() => loadSavedCode(problemId, starterCode));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom Test Cases state
  const [customTestCases, setCustomTestCases] = useState<PracticeTestCase[]>(() => loadCustomTestCases(problemId));

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => loadSubmissions(problemId));

  // Execution state
  const [status, setStatus] = useState<'idle' | 'running' | 'submitting'>('idle');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [lastAction, setLastAction] = useState<'run' | 'submit' | null>(null);

  const executorRef = useRef<CodeExecutor | null>(null);

  // Splitter A (Horizontal) dragging ref
  const splitARef = useRef<HTMLDivElement | null>(null);
  const isDraggingARef = useRef<boolean>(false);

  // Splitter B (Vertical) dragging ref
  const splitBRef = useRef<HTMLDivElement | null>(null);
  const isDraggingBRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      executorRef.current?.terminate();
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Debounced Autosave
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setSaveStatus('saving');

      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        saveUserCode(problemId, newCode);
        setSaveStatus('saved');
      }, 700);
    },
    [problemId],
  );

  if (!problem) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#f87171', background: '#0f172a', minHeight: '100vh' }}>
        Problem "{problemId}" not found.
      </div>
    );
  }

  const pageDoc = getPageByRoute(permalink);
  const solved = pageDoc ? isSolved(pageDoc, events) : false;
  const learnPages = getFlatPages();
  const concept = pageDoc ? relatedLesson(pageDoc, learnPages) : undefined;
  const allPractice = getPracticeProblems();
  const nextProb = recommendedProblem(allPractice.filter((p) => p.route !== permalink), events, concept);

  function ensureExecutor(): CodeExecutor {
    if (!executorRef.current) {
      if (problem?.judgeMode === 'server' || problem?.judgeMode === 'hybrid') {
        executorRef.current = new ServerExecutor({ enableFallback: true });
      } else {
        executorRef.current = new PyodideExecutor();
      }
    }
    return executorRef.current;
  }

  async function executeCode(cases: PracticeTestCase[], action: 'run' | 'submit') {
    setStatus(action === 'run' ? 'running' : 'submitting');
    setLastAction(action);

    const executor = ensureExecutor();
    const res = await executor.execute({
      code,
      functionName: problem!.functionName,
      testCases: cases,
    });

    const usesLibrary = /\b(import\s+numpy|from\s+numpy|import\s+scipy|import\s+torch|import\s+tensorflow|np\.)\b/.test(code);
    res.usesLibrary = usesLibrary;

    if (res.status === 'success') {
      const bonusAvailable = problem?.bonusPoints ?? 0;
      if (!usesLibrary && bonusAvailable > 0) {
        res.bonusEarned = true;
        res.bonusPoints = bonusAvailable;
        res.bonusMessage = `+${bonusAvailable} Bonus — ${problem?.bonusDescription ?? 'Pure Python implementation'}`;
      } else {
        res.bonusEarned = false;
        res.bonusPoints = 0;
        res.bonusMessage = usesLibrary ? 'Accepted — Library-assisted solution' : undefined;
      }
    }

    setResult(res);
    setStatus('idle');

    if (action === 'submit') {
      const passedCount = res.caseResults.filter((c) => c.passed).length;
      const totalCount = res.caseResults.length;

      recordSubmission(problemId, {
        code,
        status: res.status,
        passedCount,
        totalCount,
        totalExecutionTimeMs: res.totalExecutionTimeMs,
      });

      setSubmissions(loadSubmissions(problemId));

      if (res.status === 'success') {
        const bonusToAward = res.bonusEarned ? (res.bonusPoints ?? 0) : 0;
        awardProblemCompleted(permalink, problem.difficulty, bonusToAward);
      }
    }
  }

  function handleRun() {
    const visibleCases = problem!.testCases.filter((tc) => !tc.hidden);
    const combinedCases = [...visibleCases, ...customTestCases];
    void executeCode(combinedCases, 'run');
  }

  function handleSubmit() {
    // Submit runs against the complete system test suite (all visible + hidden tests)
    void executeCode(problem!.testCases, 'submit');
  }

  function handleReset() {
    if (!window.confirm('Reset your code to the original starter template? Unsaved changes will be lost.')) return;
    setCode(starterCode);
    saveUserCode(problemId, starterCode);
    setSaveStatus('saved');
    setResult(null);
    executorRef.current?.terminate();
    executorRef.current = null;
  }

  function handleStop() {
    executorRef.current?.terminate();
    executorRef.current = null;
    setStatus('idle');
  }

  function handleAddCustomTest(input: Record<string, unknown>, expected?: unknown) {
    const newCase: PracticeTestCase = {
      id: `custom-${Date.now()}`,
      label: `Custom Test ${customTestCases.length + 1}`,
      input,
      expectedOutput: expected,
    };
    const updated = [...customTestCases, newCase];
    setCustomTestCases(updated);
    saveCustomTestCases(problemId, updated);
  }

  function handleRemoveCustomTest(id: string) {
    const updated = customTestCases.filter((c) => c.id !== id);
    setCustomTestCases(updated);
    saveCustomTestCases(problemId, updated);
  }

  // Draggable Splitter A (Horizontal) Handlers
  const onPointerDownA = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingARef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMoveA = (e: React.PointerEvent) => {
    if (!isDraggingARef.current || !splitARef.current) return;
    const rect = splitARef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(80, Math.max(20, pct));
    setLeftWidthPct(clamped);
    saveLayoutSplit({ leftWidthPct: clamped, topHeightPct });
  };
  const onPointerUpA = (e: React.PointerEvent) => {
    isDraggingARef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Draggable Splitter B (Vertical) Handlers
  const onPointerDownB = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingBRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMoveB = (e: React.PointerEvent) => {
    if (!isDraggingBRef.current || !splitBRef.current) return;
    const rect = splitBRef.current.getBoundingClientRect();
    const pct = ((e.clientY - rect.top) / rect.height) * 100;
    const clamped = Math.min(80, Math.max(20, pct));
    setTopHeightPct(clamped);
    saveLayoutSplit({ leftWidthPct, topHeightPct: clamped });
  };
  const onPointerUpB = (e: React.PointerEvent) => {
    isDraggingBRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const isBusy = status !== 'idle';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#090d16',
        color: '#f8fafc',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          height: 48,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/"
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#f8fafc',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Neural Mastery
          </Link>

          <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.15)' }} />

          <Link
            to="/practice"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#94a3b8',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ← Practice
          </Link>

          <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.15)' }} />

          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{problem.title}</span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 4,
              background: problem.difficulty === 'easy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: problem.difficulty === 'easy' ? '#34d399' : '#fbbf24',
            }}
          >
            {problem.difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/learn" style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>
            Learn
          </Link>

          <Link to="/practice" style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', textDecoration: 'none' }}>
            Practice
          </Link>

          <Link to="/leaderboard" style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>
            Leaderboard
          </Link>

          <StreakBadge />
          <AuthButton />

          {nextProb && (
            <Link
              to={nextProb.route}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#818cf8',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              Next →
            </Link>
          )}
        </div>
      </header>

      {/* Main Resizable Workspace */}
      <div
        ref={splitARef}
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns:
            focusMode === 'problem'
              ? '1fr 0px 0px'
              : focusMode === 'editor' || focusMode === 'results'
                ? '0px 0px 1fr'
                : `${leftWidthPct}% 6px 1fr`,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Left: Problem Panel */}
        <div style={{ height: '100%', overflow: 'hidden', display: focusMode === 'editor' || focusMode === 'results' ? 'none' : 'block' }}>
          <ProblemPanel
            problem={problem}
            mdxContent={mdxContent}
            solved={solved}
            isFocused={focusMode === 'problem'}
            onExpandFocus={() => setFocusMode(focusMode === 'problem' ? 'normal' : 'problem')}
          />
        </div>

        {/* Splitter A (Horizontal Divider) */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize problem and workspace panels"
          onPointerDown={onPointerDownA}
          onPointerMove={onPointerMoveA}
          onPointerUp={onPointerUpA}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 10,
            transition: 'background 0.15s ease',
            display: focusMode !== 'normal' ? 'none' : 'block',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#6366f1')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)')}
        />

        {/* Right: Coding & Testing Workspace */}
        <div
          ref={splitBRef}
          style={{
            height: '100%',
            display: 'grid',
            gridTemplateRows:
              focusMode === 'editor'
                ? '1fr 0px 0px'
                : focusMode === 'results'
                  ? '0px 0px 1fr'
                  : `${topHeightPct}% 6px 1fr`,
            overflow: 'hidden',
            background: '#020617',
          }}
        >
          {/* Top: Code Editor Pane */}
          <div style={{ height: '100%', overflow: 'hidden', display: focusMode === 'results' ? 'none' : 'block' }}>
            <CodeEditorPane
              code={code}
              onChangeCode={handleCodeChange}
              onRun={handleRun}
              onSubmit={handleSubmit}
              onReset={handleReset}
              onStop={handleStop}
              isBusy={isBusy}
              status={status}
              saveStatus={saveStatus}
              isFullscreen={focusMode === 'editor'}
              onToggleFullscreen={() => setFocusMode(focusMode === 'editor' ? 'normal' : 'editor')}
            />
          </div>

          {/* Splitter B (Vertical Divider) */}
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize code editor and test results panels"
            onPointerDown={onPointerDownB}
            onPointerMove={onPointerMoveB}
            onPointerUp={onPointerUpB}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              cursor: 'row-resize',
              position: 'relative',
              zIndex: 10,
              transition: 'background 0.15s ease',
              display: focusMode !== 'normal' ? 'none' : 'block',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#6366f1')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)')}
          />

          {/* Bottom: Test Results Pane */}
          <div style={{ height: '100%', overflow: 'hidden', display: focusMode === 'editor' ? 'none' : 'block' }}>
            <TestResultsPane
              testCases={problem.testCases}
              customTestCases={customTestCases}
              onAddCustomTest={handleAddCustomTest}
              onRemoveCustomTest={handleRemoveCustomTest}
              result={result}
              lastAction={lastAction}
              submissions={submissions}
              onLoadSubmissionCode={(c) => {
                setCode(c);
                saveUserCode(problemId, c);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
