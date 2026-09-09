# Spec: Canvas Agent Builder + Python Playground toggle (v1 scope: react-agent-loop)

## Origin

Direct user request, evolved across three messages tonight:
1. "how ideally we want to plan is react agent. problem statement... next
   we should [have] one playground. for example we will provide all the
   components, with name what they have to do, taking agent component and
   connecting it together to design production level react agent. that
   includes database also. in playground if they connect successfully we
   have give points. next react agent with langchain or [any] agent if
   they solve. that is the practically way to learn react agent"
2. "i got great idea, making canvas playground and python playground and
   toggle option to switch between both. canvas to take the component and
   build agent. python playground for code."

So: one problem (`react-agent-loop` for v1), two modes, one toggle:
- **Canvas mode**: drag/connect real, named architecture components (LLM
  Reasoner, Tool nodes, Memory, Database) into a correct production ReAct
  agent topology. Correct wiring = real points.
- **Python mode**: the existing code-editor experience (already shipped:
  `PracticeWorkspace`/`CodeEditorPane`, real Pyodide execution, real test
  cases) — implement the actual loop in Python.
- A later tier (explicitly called out by the user, NOT v1): a LangChain (or
  other real framework) implementation of the same agent, graded for real.

## Why this is genuinely good (validate before building)

No direct competitor (LeetCode, deep-ml.com, HackerRank) teaches agent
*architecture* this way — they're all function-in, tests-pass-out. A
correctly-scored visual wiring exercise for a real production topology,
sitting next to a real code implementation of the same concept, is a real
differentiator matching this platform's "world class, not demo" bar. Build
it for real, once, well — not as a generic unproven engine for all 1,549
problems.

## Scope for v1 (do not expand beyond this without a follow-up decision)

One problem only: `react-agent-loop`. Prove the mechanism works end to end
on one real, correctly-designed example before generalizing to any other
problem or architecture pattern (multi-agent, plan-and-execute, etc.).

## The reference architecture (the "correct answer" the canvas is graded against)

A production ReAct agent's real topology, matching
`src/content/docs/agents/react-agent-production.mdx` (being written right
now, read it once it exists — do not contradict it):

```
User Query -> [Reasoner (LLM)] <-> [Tool Router] -> one of: [Search Tool] / [Calculator Tool] / [Database Tool]
                    ^                                                                              |
                    |------------------ Observation -------------------------------------------- <-+
                    |
              [Memory / Context Store] <-> [Database] (persistence for memory across sessions)
                    |
                    v
              [Final Answer] (loop-exit condition)
```

Required nodes for a "correct" v1 build (this is the real, specific
grading target — not vague):
1. **Reasoner** (the LLM call) — exactly one, the hub.
2. **At least one Tool** node, connected bidirectionally to the Reasoner
   (action out, observation back).
3. **Memory** node, connected to the Reasoner (reads/writes context each
   iteration).
4. **Database** node, connected to Memory (not directly to the Reasoner —
   a real, correct constraint: the agent doesn't talk to the DB raw, it
   goes through its memory/context layer, matching real systems like
   LangGraph's persistent checkpointer).
5. **Final Answer / loop-exit** node, connected from the Reasoner.

An incorrect-but-common mistake to detect and give real feedback on (not
just "wrong"): connecting Database directly to the Reasoner (skipping
Memory) — call this out specifically when detected, since it's a genuine,
common production misunderstanding.

## UI shape

- Add a mode toggle to `PracticeWorkspace`'s right-hand pane header,
  alongside/replacing the language selector for problems that support it:
  "Canvas" / "Python". Only show the toggle when a problem has canvas data
  (new optional field on `PracticeProblem`, e.g. `canvasSpec`) — every
  other problem keeps today's Python-only editor unchanged.
- **Canvas mode**: a real drag-and-drop graph editor. CONFIRMED:
  `@xyflow/react` (React Flow) is already a real dependency in
  `package.json`, and `src/viz/AgentExecutionGraph.tsx` already uses it
  for a ReAct-trace visualization — read that file first for the real
  styling/integration convention (`useVizTokens`, `VisualizationContainer`,
  `Background`, `Controls`). That component is READ-ONLY (static
  step-through, nodes aren't draggable/connectable) — this task needs the
  real interactive surface: draggable nodes, user-created edges via
  `onConnect`/`addEdge`, and `Handle` components on each node type. Do not
  hand-roll drag/connect/hit-testing logic — React Flow supports all of
  this natively; use its real API, don't reinvent it.
- **Python mode**: unchanged — today's `CodeEditorPane`/Pyodide flow.
- **Grading (Canvas mode)**: on every edge add/remove, or on an explicit
  "Verify Architecture" button (pick whichever is less janky once you see
  it built — a live/continuous check risks feeling broken mid-drag),
  compare the learner's current graph against the required-nodes/required-
  edges rule above. All correct -> real success state (same visual
  language as a passing test run) + award real points via a new
  `AwardEvent` kind (e.g. `'architecture'`) added to `gamification.ts`'s
  existing kind union — reuse the existing award/points/confetti
  machinery (`awardProblemCompleted`-style function, `triggerConfetti()`),
  don't build a parallel one. Partially correct -> specific, real
  feedback (which required connection is missing, or the Database-direct-
  to-Reasoner mistake called out above) — not a bare pass/fail.

## Explicitly NOT in v1 (flag if asked to expand, don't silently build)

- The LangChain/real-framework-graded tier the user mentioned as "next."
- Any other problem besides `react-agent-loop`.
- A generic "canvas spec" authoring pipeline for arbitrary future
  architecture problems — ship the one real, hand-designed spec above
  first.

## Verification

Same standard as everything else in this repo: full chain
(`typecheck && test:unit && build && check:links`), real interaction
testing of the canvas (drag a node, make a connection, verify the
correct-graph case actually triggers the award/points once — and only
once, matching the existing `hasAward` de-dupe pattern — and that the
Database-direct mistake produces the specific real feedback described
above, not a generic wrong-answer message). Real screenshots before
calling this done, per this repo's standing screenshot-verification
discipline.

## Status

STARTING NOW (2026-09-09). The blocking content task
(`react-agent-production.mdx`) is live and verified (commits `d1e9328`,
`6c336d7`, CI/Deploy green). User has re-confirmed priority ("i cant see
any canvas playground where i can find it" / "please complete all the
work dont sit ideal") — build this for real now, full verification
required before every commit, same standard as everything else in this
repo.
