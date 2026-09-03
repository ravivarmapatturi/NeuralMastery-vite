import { useMemo, useState } from 'react';
import { useVizTokens, SPACING, RADIUS, FONT_FAMILY } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, PillSelect, VisualizationStepController, useStepController } from './primitives';

type Mode = 'two-pointer' | 'sliding-window';

const DEFAULT_ARRAY = '1, 2, 3, 4, 6';
const DEFAULT_TARGET = 6;
const DEFAULT_STRING = 'abcabcbb';
const MAX_ELEMENTS = 12;

interface TwoPointerStep {
  left: number;
  right: number;
  sum: number;
  outcome: 'less' | 'greater' | 'equal' | 'exhausted';
}

function computeTwoPointerSteps(arr: number[], target: number): TwoPointerStep[] {
  const steps: TwoPointerStep[] = [];
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      steps.push({ left, right, sum, outcome: 'equal' });
      return steps;
    }
    if (sum < target) {
      steps.push({ left, right, sum, outcome: 'less' });
      left += 1;
    } else {
      steps.push({ left, right, sum, outcome: 'greater' });
      right -= 1;
    }
  }
  steps.push({ left, right, sum: NaN, outcome: 'exhausted' });
  return steps;
}

interface WindowStep {
  right: number;
  windowStart: number;
  char: string;
  jumped: boolean;
  bestLen: number;
  bestStart: number;
}

function computeSlidingWindowSteps(s: string): WindowStep[] {
  const steps: WindowStep[] = [];
  const lastSeen = new Map<string, number>();
  let windowStart = 0;
  let best = 0;
  let bestStart = 0;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    let jumped = false;
    const prev = lastSeen.get(ch);
    if (prev !== undefined && prev >= windowStart) {
      windowStart = prev + 1;
      jumped = true;
    }
    lastSeen.set(ch, i);
    const curLen = i - windowStart + 1;
    if (curLen > best) {
      best = curLen;
      bestStart = windowStart;
    }
    steps.push({ right: i, windowStart, char: ch, jumped, bestLen: best, bestStart });
  }
  return steps;
}

function parseArray(text: string): number[] {
  return text
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n))
    .slice(0, MAX_ELEMENTS);
}

export default function TwoPointersSlidingWindowExplorer() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('two-pointer');

  const [arrayText, setArrayText] = useState(DEFAULT_ARRAY);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const array = useMemo(() => parseArray(arrayText), [arrayText]);
  const twoPointerSteps = useMemo(() => (array.length >= 2 ? computeTwoPointerSteps(array, target) : []), [array, target]);

  const [str, setStr] = useState(DEFAULT_STRING);
  const trimmedStr = useMemo(() => str.slice(0, MAX_ELEMENTS + 8), [str]);
  const windowSteps = useMemo(() => (trimmedStr.length > 0 ? computeSlidingWindowSteps(trimmedStr) : []), [trimmedStr]);

  const totalSteps = mode === 'two-pointer' ? twoPointerSteps.length : windowSteps.length;
  const controller = useStepController(Math.max(totalSteps, 1), 1100);
  const stepIdx = Math.min(controller.step, Math.max(totalSteps - 1, 0));

  const boxSize = 46;

  return (
    <VisualizationContainer footer="Both modes run the exact algorithm described on the linked practice problem, one real step at a time -- not a pre-rendered animation. Edit the input and every step recomputes live.">
      <VisualizationHeader eyebrow="Interactive" title="Two Pointers &amp; Sliding Window, Step by Step" />

      <PillSelect<Mode>
        label="Pattern"
        value={mode}
        onChange={(v) => {
          setMode(v as Mode);
          controller.reset();
        }}
        options={[
          { value: 'two-pointer', label: 'Two Pointers' },
          { value: 'sliding-window', label: 'Sliding Window' },
        ]}
      />

      {mode === 'two-pointer' ? (
        <div style={{ marginBottom: SPACING.sm, display: 'flex', gap: SPACING.sm, flexWrap: 'wrap' }}>
          <label style={{ flex: '1 1 220px', fontSize: 13, color: t.textSecondary }}>
            Sorted array (comma-separated, ascending, max {MAX_ELEMENTS})
            <input
              type="text"
              value={arrayText}
              onChange={(e) => {
                setArrayText(e.target.value);
                controller.reset();
              }}
              style={inputStyle(t)}
            />
          </label>
          <label style={{ width: 120, fontSize: 13, color: t.textSecondary }}>
            Target sum
            <input
              type="number"
              value={target}
              onChange={(e) => {
                setTarget(Number(e.target.value));
                controller.reset();
              }}
              style={inputStyle(t)}
            />
          </label>
        </div>
      ) : (
        <div style={{ marginBottom: SPACING.sm }}>
          <label style={{ fontSize: 13, color: t.textSecondary }}>
            String (max {MAX_ELEMENTS + 8} characters)
            <input
              type="text"
              value={str}
              onChange={(e) => {
                setStr(e.target.value);
                controller.reset();
              }}
              style={{ ...inputStyle(t), width: '100%' }}
            />
          </label>
        </div>
      )}

      {mode === 'two-pointer' && array.length < 2 && (
        <div style={{ fontSize: 13, color: t.accentWarn }}>Enter at least two numbers, ascending.</div>
      )}
      {mode === 'sliding-window' && trimmedStr.length === 0 && (
        <div style={{ fontSize: 13, color: t.accentWarn }}>Enter a non-empty string.</div>
      )}

      {mode === 'two-pointer' && array.length >= 2 && twoPointerSteps.length > 0 && (
        <TwoPointerView array={array} target={target} step={twoPointerSteps[stepIdx]} boxSize={boxSize} t={t} />
      )}

      {mode === 'sliding-window' && trimmedStr.length > 0 && windowSteps.length > 0 && (
        <SlidingWindowView s={trimmedStr} step={windowSteps[stepIdx]} boxSize={boxSize} t={t} />
      )}

      {totalSteps > 0 && (
        <VisualizationStepController
          controller={controller}
          totalSteps={totalSteps}
          stepLabel={(s) => `Step ${s + 1} / ${totalSteps}`}
        />
      )}
    </VisualizationContainer>
  );
}

function inputStyle(t: ReturnType<typeof useVizTokens>): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    marginTop: 4,
    padding: '6px 10px',
    borderRadius: RADIUS.sm,
    border: `1px solid ${t.border}`,
    background: t.background,
    color: t.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    boxSizing: 'border-box',
  };
}

function TwoPointerView({
  array,
  target,
  step,
  boxSize,
  t,
}: {
  array: number[];
  target: number;
  step: TwoPointerStep;
  boxSize: number;
  t: ReturnType<typeof useVizTokens>;
}) {
  const { left, right, sum, outcome } = step;
  const matched = outcome === 'equal';

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 4, width: 'max-content' }}>
          {array.map((val, i) => {
            const isLeft = i === left;
            const isRight = i === right;
            let border = t.border;
            let bg = t.surfaceAlt;
            if (matched && (isLeft || isRight)) {
              border = t.accentPrimary;
              bg = `${t.accentPrimary}33`;
            } else if (isLeft && isRight) {
              border = t.accentPurple;
              bg = `${t.accentPurple}33`;
            } else if (isLeft) {
              border = t.accentSecondary;
              bg = `${t.accentSecondary}26`;
            } else if (isRight) {
              border = t.accentPurple;
              bg = `${t.accentPurple}26`;
            }
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: boxSize,
                    height: boxSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: RADIUS.sm,
                    border: `2px solid ${border}`,
                    background: bg,
                    fontSize: 15,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    color: t.textPrimary,
                  }}
                >
                  {val}
                </div>
                <div style={{ fontSize: 10, color: t.textMuted, height: 14 }}>
                  {isLeft && isRight ? 'L,R' : isLeft ? 'L' : isRight ? 'R' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: SPACING.xs, fontSize: 13, color: t.textSecondary, fontFamily: 'ui-monospace, monospace' }}>
        {outcome === 'exhausted' ? (
          <span style={{ color: t.accentDanger }}>Pointers crossed -- no pair sums to {target}.</span>
        ) : (
          <>
            arr[L]={array[left]} + arr[R]={array[right]} = <strong style={{ color: t.textPrimary }}>{sum}</strong>
            {' vs target '}
            {target}
            {' -> '}
            {outcome === 'equal' && <span style={{ color: t.accentPrimary, fontWeight: 700 }}>match found!</span>}
            {outcome === 'less' && <span style={{ color: t.accentSecondary }}>too small, move L right</span>}
            {outcome === 'greater' && <span style={{ color: t.accentPurple }}>too big, move R left</span>}
          </>
        )}
      </div>
    </div>
  );
}

function SlidingWindowView({
  s,
  step,
  boxSize,
  t,
}: {
  s: string;
  step: WindowStep;
  boxSize: number;
  t: ReturnType<typeof useVizTokens>;
}) {
  const { right, windowStart, jumped, bestLen, bestStart } = step;

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 4, width: 'max-content' }}>
          {s.split('').map((ch, i) => {
            const inWindow = i >= windowStart && i <= right;
            const isCursor = i === right;
            const visited = i <= right;
            let border = t.border;
            let bg = t.surfaceAlt;
            if (inWindow) {
              border = isCursor ? t.accentPrimary : t.accentSecondary;
              bg = `${t.accentSecondary}26`;
            } else if (!visited) {
              bg = t.background;
            }
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: boxSize,
                    height: boxSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: RADIUS.sm,
                    border: `2px solid ${border}`,
                    background: bg,
                    fontSize: 16,
                    fontWeight: 600,
                    color: visited ? t.textPrimary : t.textMuted,
                    opacity: visited ? 1 : 0.5,
                  }}
                >
                  {ch}
                </div>
                <div style={{ fontSize: 10, color: t.textMuted, height: 14 }}>
                  {i === windowStart && i === right ? 'start,cur' : i === windowStart ? 'start' : isCursor ? 'cur' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: SPACING.xs, fontSize: 13, color: t.textSecondary, fontFamily: 'ui-monospace, monospace' }}>
        {jumped ? (
          <span>
            {"'"}
            {step.char}
            {"'"} already in the window -&gt; window start jumps to {windowStart}
          </span>
        ) : (
          <span>
            {"'"}
            {step.char}
            {"'"} is new to the window -&gt; window grows to [{windowStart}, {right}]
          </span>
        )}
        <span style={{ marginLeft: 10, color: t.accentPrimary, fontWeight: 600 }}>
          best so far: {bestLen} ({s.slice(bestStart, bestStart + bestLen)})
        </span>
      </div>
    </div>
  );
}
