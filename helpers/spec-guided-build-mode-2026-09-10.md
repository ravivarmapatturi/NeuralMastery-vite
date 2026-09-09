# Spec: Guided Build mode (v1 scope: react-agent-loop)

## Origin

Direct user request: "if we have bring one feature solve step by step
breaking the code into 5 parts. step 1 fill the function details and user
core details if user submits automatically the code has to fill the full
solution lets after 5 steps successful solution will be filled and he
will just click run and submit."

Real, well-established learning-science technique this maps to: **fading
scaffolds / worked examples with progressive disclosure** — break a hard
problem into small, sequential sub-tasks; after each one, the learner sees
the correct code for that piece merged in before moving to the next, so
by the end they've built the whole solution incrementally instead of
staring at a blank function. This is the SAME progressive-disclosure
principle already used for hints (`hints.small/strong/concept`) and the
"How to Solve This, Step by Step" walkthrough shipped earlier today —
this feature is the code-writing equivalent of that, not a new paradigm.

## Scope for v1 (do not expand without a follow-up decision)

One problem only: `react-agent-loop` (the same flagship problem the
Canvas Builder was scoped to — this repo's established pattern is prove
one real, well-designed example before generalizing to any of the other
1,549 problems).

## The real UX

A third toggle mode alongside the existing `Canvas` / `Python` modes:
`[ 🎨 Canvas | 🐍 Python | 🪜 Guided ]` (exact icon/label your call, follow
the existing toggle's visual style in `PracticeWorkspace.tsx`/
`CodeEditorPane.tsx`).

Guided mode replaces the code editor pane with:
1. A step indicator: "Step X of 5" plus a short, specific title for that
   step (e.g. "Step 1: Parse the agent output for Final Answer vs
   Action").
2. A real, specific prompt describing exactly what code to write for this
   step only (not the whole problem) — pulled from real, per-step
   structured data (see below), never a generic "write some code" filler.
3. A code editor scoped to that step (either the full function with only
   this step's region editable/highlighted, or a smaller isolated
   snippet — pick whichever is less confusing once you see it built; the
   full-function-with-highlighted-region approach is likely clearer since
   the learner keeps seeing the whole shape growing).
4. A "Submit Step" button (distinct from the final Run/Submit buttons,
   which stay disabled/hidden until step 5 completes). On click:
   - Real validation for that step specifically (e.g. run a step-scoped
     assertion if one exists for that sub-piece, or at minimum a syntax/
     parse check) -- do not fabricate a pass on literally anything typed.
   - Whether the learner's own code for that step was right or not, the
     editor then shows the REAL correct code for that step merged into
     the accumulating solution (matching the user's explicit instruction
     "the code has to fill the full solution" progressively) -- this is
     intentionally a worked-example/scaffold, not a pass/fail gate that
     blocks progress.
   - Advance to step X+1.
5. After step 5, the editor contains the complete, correct, real reference
   solution for `react_agent_step`. At that point show the EXISTING real
   Run/Submit buttons (reuse `CodeEditorPane`'s real Pyodide execution
   path unchanged) so the learner does one real, normal submission against
   the real test suite to finish the problem exactly like every other
   problem on the platform -- do not build a second, parallel submission
   mechanism.

## Data needed: a real 5-step breakdown for `react_agent_step`

Add a new optional field on `PracticeProblem` (e.g. `guidedSteps`), an
array of exactly 5 real, specific entries for `react-agent-loop`:
`{ title: string; prompt: string; code: string }` where `code` is the
REAL reference-solution fragment for that step (verified by actually
assembling all 5 `code` fragments in order and confirming the result
equals -- or is behaviorally equivalent to -- the problem's real, already-
verified reference solution; run it against the problem's real test cases
to prove this, don't eyeball it). A sensible real 5-way split of
`react_agent_step` (read the actual current reference solution in
`practiceProblem.ts` first, then decide the real boundaries -- don't
invent step boundaries that don't correspond to real, separable pieces of
the actual logic): something like (1) function signature + detect
`Final Answer:` case, (2) parse `Action:` and `Action Input:` when no
final answer, (3) validate the requested tool exists in `available_tools`,
(4) invoke the tool and capture its result/exception, (5) assemble and
return the final `{status, ...}` dict shape. Adjust to match the real
code, don't force this exact split if the real logic divides differently.

## Verification (required, same standard as every other feature shipped today)

- The 5 `code` fragments, concatenated/assembled in the real editor exactly
  as the feature will do it, must produce a function that passes the
  problem's real, existing test cases -- prove this with an actual
  executed test run, not inspection.
- Full chain: `npm run typecheck && npm run test:unit && npm run build &&
  npm run check:links`.
- Real interaction testing: step through all 5 steps in a real browser
  (Playwright), confirm the editor content after step 5 matches the real
  reference solution, then click the real Run/Submit and confirm it
  actually passes against the real Pyodide-executed test suite (not
  simulated) -- exactly the same rigor used to verify the Canvas Builder
  earlier today (drag/connect real interactions, not just reading the
  diff).
- Real screenshots of at least steps 1, 3, and 5, light and dark theme.

## Explicitly NOT in v1

- Any problem besides `react-agent-loop`.
- A generic "guided steps" authoring pipeline for arbitrary future
  problems -- ship the one real, hand-designed 5-step breakdown first.
- Removing or changing the Canvas or Python modes -- this is purely an
  additive third mode.
