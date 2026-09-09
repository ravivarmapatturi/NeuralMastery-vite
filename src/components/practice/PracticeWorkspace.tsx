import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProblemPanel from './ProblemPanel';
import CodeEditorPane from './CodeEditorPane';
import TestResultsPane from './TestResultsPane';
import { getPracticeProblem, type PracticeTestCase } from '../../lib/practiceProblem';

// Lazy-loaded: @xyflow/react is a real, sizeable dependency that only
// react-agent-loop (v1 scope) actually needs -- a static import would pull
// it into every practice page's main bundle regardless of whether the
// visitor ever opens Canvas mode.
const CanvasAgentBuilder = lazy(() => import('../canvas/CanvasAgentBuilder'));
import {
  loadSavedCode,
  saveUserCode,
  loadCustomTestCases,
  saveCustomTestCases,
  loadSubmissions,
  recordSubmission,
  loadLayoutSplit,
  saveLayoutSplit,
  recordHintViewed,
  hasViewedHints,
  type SubmissionRecord,
} from '../../lib/practicePersistence';
import { PyodideExecutor } from '../../lib/execution/pyodideExecutor';
import { ServerExecutor } from '../../lib/execution/serverExecutor';
import type { CodeExecutor, ExecutionResult } from '../../lib/execution/types';
import AuthButton from '../layout/AuthButton';
import StreakBadge from '../layout/StreakBadge';
import { showRewardToast } from '../ui/Confetti';
import { useGamification } from '../../contexts/GamificationContext';
import { normalizeRoute, getFlatPages, getPageByRoute, getPracticeProblems } from '../../lib/contentTree';
import { isSolved, recommendedProblem, relatedLesson } from '../../lib/mastery';
import { getProblemAward, getMasteryTier } from '../../lib/gamification';

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

  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'results' | 'canvas'>('problem');

  // Canvas / Python mode state
  const hasCanvas = Boolean(problem?.canvasSpec);
  const [workspaceMode, setWorkspaceMode] = useState<'canvas' | 'python'>(() => (hasCanvas ? 'canvas' : 'python'));

  useEffect(() => {
    if (hasCanvas) {
      setWorkspaceMode('canvas');
    } else {
      setWorkspaceMode('python');
    }
  }, [hasCanvas, problemId]);

  const modeToggle = hasCanvas ? (
    <div
      role="tablist"
      aria-label="Workspace mode"
      data-testid="canvas-python-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: 2,
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid var(--nm-border, rgba(255, 255, 255, 0.12))',
        borderRadius: 6,
        gap: 2,
      }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={workspaceMode === 'canvas'}
        data-testid="toggle-canvas-mode"
        onClick={() => setWorkspaceMode('canvas')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 9px',
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 4,
          border: 'none',
          cursor: 'pointer',
          background: workspaceMode === 'canvas' ? 'var(--nm-accent-primary, #3DDC97)' : 'transparent',
          color: workspaceMode === 'canvas' ? '#0A0A0B' : 'var(--nm-text-secondary, #ABABB3)',
          transition: 'all 0.15s ease',
        }}
      >
        <span>🎨</span> Canvas
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={workspaceMode === 'python'}
        data-testid="toggle-python-mode"
        onClick={() => setWorkspaceMode('python')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 9px',
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 4,
          border: 'none',
          cursor: 'pointer',
          background: workspaceMode === 'python' ? 'var(--nm-accent-primary, #3DDC97)' : 'transparent',
          color: workspaceMode === 'python' ? '#0A0A0B' : 'var(--nm-text-secondary, #ABABB3)',
          transition: 'all 0.15s ease',
        }}
      >
        <span>🐍</span> Python
      </button>
    </div>
  ) : null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const problemAward = getProblemAward(events, permalink);
  const masteryTier = getMasteryTier(problemAward);
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

    if (action === 'run') {
      void import('../../lib/firebase').then(({ trackFeatureEvent }) => trackFeatureEvent('practice_problem_attempt', { problem_id: problemId }));
    }

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
    if (isMobile) {
      setMobileTab('results');
    }

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
        const hintUsed = hasViewedHints(problemId);
        awardProblemCompleted(permalink, problem.difficulty, bonusToAward, hintUsed);
        void import('../../lib/firebase').then(({ trackFeatureEvent }) => trackFeatureEvent('practice_problem_solve', { problem_id: problemId }));

        showRewardToast({
          title: 'Problem Solved!',
          subtitle: `All ${res.caseResults.length} test cases passed. Real browser verification complete!`,
          icon: '⚡',
          type: 'celebration',
        });
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
      className="nm-practice-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        maxWidth: '100vw',
        background: 'var(--nm-bg)',
        color: 'var(--nm-text-primary)',
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
          padding: isMobile ? '6px 10px' : '8px 16px',
          background: 'var(--nm-surface)',
          borderBottom: '1px solid var(--nm-border)',
          height: 48,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, minWidth: 0, flex: '1 1 auto' }}>
          {!isMobile && (
            <>
              <Link
                to="/"
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--nm-text-primary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                Neural Mastery
              </Link>
              <div style={{ height: 16, width: 1, background: 'var(--nm-border)' }} />
            </>
          )}

          <Link
            to="/practice"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--nm-text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            ← Practice
          </Link>

          <div style={{ height: 16, width: 1, background: 'var(--nm-border)', flexShrink: 0 }} />

          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--nm-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? 100 : 'none',
              minWidth: 0,
            }}
            title={problem.title}
          >
            {problem.title}
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '2px 6px',
              borderRadius: 4,
              background: `color-mix(in srgb, ${
                problem.difficulty === 'easy'
                  ? 'var(--nm-accent-primary)'
                  : problem.difficulty === 'medium'
                    ? 'var(--nm-accent-warn)'
                    : 'var(--nm-accent-danger)'
              } 12%, transparent)`,
              color:
                problem.difficulty === 'easy'
                  ? 'var(--nm-accent-primary)'
                  : problem.difficulty === 'medium'
                    ? 'var(--nm-accent-warn)'
                    : 'var(--nm-accent-danger)',
              border: `1px solid color-mix(in srgb, ${
                problem.difficulty === 'easy'
                  ? 'var(--nm-accent-primary)'
                  : problem.difficulty === 'medium'
                    ? 'var(--nm-accent-warn)'
                    : 'var(--nm-accent-danger)'
              } 25%, transparent)`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {problem.difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 14, flexShrink: 0 }}>
          {!isMobile && (
            <>
              <Link to="/learn" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-text-secondary)', textDecoration: 'none' }}>
                Learn
              </Link>
              <Link to="/practice" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-accent-secondary)', textDecoration: 'none' }}>
                Practice
              </Link>
              <Link to="/leaderboard" style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-text-secondary)', textDecoration: 'none' }}>
                Leaderboard
              </Link>
              <StreakBadge />
            </>
          )}

          <AuthButton />

          {!isMobile && nextProb && (
            <Link
              to={nextProb.route}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--nm-text-primary)',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                background: 'var(--nm-surface-alt)',
                border: '1px solid var(--nm-border)',
                whiteSpace: 'nowrap',
              }}
            >
              Next →
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Tab Control */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--nm-border)',
            background: 'var(--nm-surface-alt)',
            padding: '4px 8px',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setMobileTab('problem')}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: mobileTab === 'problem' ? 'var(--nm-surface)' : 'transparent',
              color: mobileTab === 'problem' ? 'var(--nm-text-primary)' : 'var(--nm-text-secondary)',
              boxShadow: mobileTab === 'problem' ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
              cursor: 'pointer',
            }}
          >
            Problem
          </button>
          {hasCanvas && (
            <button
              type="button"
              onClick={() => {
                setWorkspaceMode('canvas');
                setMobileTab('canvas');
              }}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                background: mobileTab === 'canvas' ? 'var(--nm-surface)' : 'transparent',
                color: mobileTab === 'canvas' ? 'var(--nm-text-primary)' : 'var(--nm-text-secondary)',
                boxShadow: mobileTab === 'canvas' ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
                cursor: 'pointer',
              }}
            >
              Canvas
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setWorkspaceMode('python');
              setMobileTab('code');
            }}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: mobileTab === 'code' ? 'var(--nm-surface)' : 'transparent',
              color: mobileTab === 'code' ? 'var(--nm-text-primary)' : 'var(--nm-text-secondary)',
              boxShadow: mobileTab === 'code' ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
              cursor: 'pointer',
            }}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('results')}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: mobileTab === 'results' ? 'var(--nm-surface)' : 'transparent',
              color: mobileTab === 'results' ? 'var(--nm-text-primary)' : 'var(--nm-text-secondary)',
              boxShadow: mobileTab === 'results' ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
              cursor: 'pointer',
            }}
          >
            Results {result ? (result.status === 'success' ? '✓' : '✗') : ''}
          </button>
        </div>
      )}

      {/* Main Resizable Workspace */}
      <div
        ref={splitARef}
        style={{
          flex: 1,
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile
            ? undefined
            : focusMode === 'problem'
              ? '1fr 0px 0px'
              : focusMode === 'editor' || focusMode === 'results'
                ? '0px 0px 1fr'
                : `${leftWidthPct}% 6px 1fr`,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Left: Problem Panel */}
        <div
          style={{
            height: '100%',
            overflow: 'hidden',
            display: isMobile
              ? mobileTab === 'problem'
                ? 'block'
                : 'none'
              : focusMode === 'editor' || focusMode === 'results'
                ? 'none'
                : 'block',
          }}
        >
          <ProblemPanel
            problem={problem}
            mdxContent={mdxContent}
            solved={solved}
            masteryTier={masteryTier}
            relatedLesson={concept}
            onHintViewed={() => recordHintViewed(problemId)}
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
            background: 'var(--nm-border)',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 10,
            transition: 'background 0.15s ease',
            display: isMobile || focusMode !== 'normal' ? 'none' : 'block',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'var(--nm-accent-secondary)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'var(--nm-border)')}
        />

        {/* Right: Coding & Testing Workspace OR Canvas Agent Builder */}
        {hasCanvas && workspaceMode === 'canvas' && problem?.canvasSpec ? (
          <div
            style={{
              height: '100%',
              display: isMobile
                ? mobileTab === 'canvas' || mobileTab === 'code'
                  ? 'flex'
                  : 'none'
                : 'flex',
              overflow: 'hidden',
              background: 'var(--nm-surface-alt)',
            }}
          >
            <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--nm-text-muted)' }}>Loading canvas…</div>}>
              <CanvasAgentBuilder
                canvasSpec={problem.canvasSpec}
                problemId={problemId}
                permalink={permalink}
                modeToggle={modeToggle}
              />
            </Suspense>
          </div>
        ) : (
          <div
            ref={splitBRef}
            style={{
              height: '100%',
              display: isMobile
                ? mobileTab !== 'problem'
                  ? 'flex'
                  : 'none'
                : 'grid',
              flexDirection: isMobile ? 'column' : undefined,
              gridTemplateRows: isMobile
                ? undefined
                : focusMode === 'editor'
                  ? '1fr 0px 0px'
                  : focusMode === 'results'
                    ? '0px 0px 1fr'
                    : `${topHeightPct}% 6px 1fr`,
              overflow: 'hidden',
              background: 'var(--nm-surface-alt)',
            }}
          >
            {/* Top: Code Editor Pane */}
            <div
              style={{
                height: '100%',
                flex: isMobile ? 1 : undefined,
                overflow: 'hidden',
                display: isMobile
                  ? mobileTab === 'code'
                    ? 'block'
                    : 'none'
                  : focusMode === 'results'
                    ? 'none'
                    : 'block',
              }}
            >
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
                modeToggle={modeToggle}
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
                background: 'var(--nm-border)',
                cursor: 'row-resize',
                position: 'relative',
                zIndex: 10,
                transition: 'background 0.15s ease',
                display: isMobile || focusMode !== 'normal' ? 'none' : 'block',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'var(--nm-accent-secondary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'var(--nm-border)')}
            />

            {/* Bottom: Test Results Pane */}
            <div
              style={{
                height: '100%',
                flex: isMobile ? 1 : undefined,
                overflow: 'hidden',
                display: isMobile
                  ? mobileTab === 'results'
                    ? 'block'
                    : 'none'
                  : focusMode === 'editor'
                    ? 'none'
                    : 'block',
              }}
            >
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
        )}
      </div>
    </div>
  );
}
