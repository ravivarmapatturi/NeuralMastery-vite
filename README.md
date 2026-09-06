# Neural Mastery

**Learn AI from first principles through real computation and interactive visualizations. Then prove it by building — in a real coding workspace.**

[neuralmasteryai.com](https://neuralmasteryai.com/) — a two-part platform: **Learn**, 270+ pages covering CS fundamentals, math for AI, machine learning, deep learning, LLMs & GenAI, agents, and MLOps, each built around real, computed, interactive components instead of static diagrams; and **Practice**, 65+ hands-on coding problems in a real in-browser IDE workspace, from linear algebra to modern LLM engineering (RoPE, GQA, SwiGLU, MoE gating, quantization).

## What makes this different

Almost every learning page follows the same shape: **intuition, then a live visualization, then the math, then the code.** The differentiator is that "live" is literal — drag a vector and its dot product recomputes for real; type a sentence into the attention demo and watch real `Q·Kᵀ/√d_k → softmax` math run on it.

On the Practice side, every problem runs in a real split-pane coding workspace: write actual Python against real, structured test cases that execute in-browser (via Pyodide/WebAssembly), get real per-case pass/fail results, and reveal a reference solution with the reasoning behind it — not an LLM grading your prose.

- **Real interactive visualizations** — SVG diagrams driven by actual computation (real gradient descent, real K-means assignment steps, real binomial self-consistency math), not illustrations.
- **A real in-browser coding workspace** — [Practice](https://neuralmasteryai.com/practice) problems run in a split-pane IDE (structured test cases, real pass/fail per case, a real code editor), not a doc page with a text box bolted on.
- **Points, streaks, and a leaderboard** — a real profile with XP/levels, topic mastery breakdown, and a solving-frequency heatmap, all driven by real activity, not vanity counters.
- **System-design challenges** — real end-to-end ML system-design prompts (RAG at scale, fraud detection, agentic systems, recommendations) with rubric-based self-assessment, the piece most coding-practice sites skip.
- **An interview Q&A cram sheet** — click-to-reveal real interview questions across LLM fundamentals, RAG, and agents, each linked back to the full concept page.
- **Primary-source-verified content** — architecture and model claims are checked directly against real docs (Hugging Face `config.json`, official API references, published papers) rather than repeated from memory.
- **Full-text search** (`Cmd+K` / `Ctrl+K`) across every page, powered by Pagefind.

## Tech stack

- **Vite + React 19 + TypeScript**, content authored in **MDX** with `import.meta.glob`-driven routing and `React.lazy`/`Suspense`
- **Pyodide** (WASM CPython) behind a normalized `CodeExecutor` abstraction, so the UI never depends on the execution engine directly
- **Firebase Auth + Firestore** for real cross-device sign-in, progress sync, and the leaderboard
- **Playwright** for end-to-end smoke tests, **Vitest** + React Testing Library for unit tests
- **Pagefind** for static full-text search
- Deployed to **GitHub Pages** behind the custom domain `neuralmasteryai.com`, with CI (typecheck, unit tests, Playwright, link/anchor checking) and deploy running on every push to `main`

## Local development

```bash
npm install
npm run dev            # dev server
npm run build           # production build to dist/
npm run test:unit       # Vitest unit tests
npm run test:smoke      # Playwright end-to-end tests
npm run check:links     # internal link + anchor validation
```

## Project structure

- `src/content/docs/` — every Learn page, as MDX, organized by topic
- `src/content/docs/practice-problems/` — every Practice problem's educational content and structured test-case metadata
- `src/viz/diagrams/` — the interactive SVG/React diagram components pages embed
- `src/components/content/` — shared content primitives (`ELI5`/`GoDeeper` progressive disclosure, `Remember` callouts, `PracticePlayground`, `RunnableCode`, `QA`)
- `src/lib/execution/` — the `CodeExecutor` abstraction and its `PyodideExecutor` implementation
- `src/contexts/` — Auth, Progress, and Gamification state, synced to Firestore
- `scripts/` — build-time codegen (page metadata, sitemap, Pagefind prerendering) and CI validation scripts
