# Neural Mastery

**A platform to learn AI structurally, through visualizations.**

[neuralmastery](https://ravivarmapatturi.github.io/NeuralMastery-vite/) — 270+ pages covering CS fundamentals, math for AI, machine learning, deep learning, LLMs & GenAI, agents, and MLOps, each built around real, computed, interactive components instead of static diagrams or screenshots.

## What makes this different

Almost every page follows the same shape: **intuition, then a live visualization, then the math, then the code.** The differentiator is that "live" is literal — drag a vector and its dot product recomputes for real; type a sentence into the attention demo and watch real `Q·Kᵀ/√d_k → softmax` math run on it; open a practice problem and write actual Python that executes in-browser (via Pyodide) against real test cases, not an LLM grading your prose.

- **Real interactive visualizations** — SVG diagrams driven by actual computation (real gradient descent, real K-means assignment steps, real binomial self-consistency math), not illustrations.
- **A real in-browser Python sandbox** — [Practice Problems](https://ravivarmapatturi.github.io/NeuralMastery-vite/docs/practice-problems/overview) let you implement a function yourself and run it against real assertions, then reveal a reference solution.
- **An interview Q&A cram sheet** — click-to-reveal real interview questions across LLM fundamentals, RAG, and agents, each linked back to the full concept page.
- **Primary-source-verified content** — architecture and model claims are checked directly against real docs (Hugging Face `config.json`, official API references, published papers) rather than repeated from memory.
- **Full-text search** (`Cmd+K` / `Ctrl+K`) across every page, powered by Pagefind.

## Tech stack

- **Vite + React 19 + TypeScript**, content authored in **MDX** with `import.meta.glob`-driven routing and `React.lazy`/`Suspense`
- **Pyodide** (WASM CPython) for the live, sandboxed practice-problem runner
- **Playwright** for end-to-end smoke tests, **Vitest** + React Testing Library for unit tests
- **Pagefind** for static full-text search
- Deployed to **GitHub Pages**, with CI (typecheck, unit tests, Playwright, link/anchor checking) and deploy running on every push to `main`

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

- `src/content/docs/` — every page, as MDX, organized by topic
- `src/viz/diagrams/` — the interactive SVG/React diagram components pages embed
- `src/components/content/` — shared content primitives (`ELI5`/`GoDeeper` progressive disclosure, `Remember` callouts, `RunnableCode`, `QA`)
- `scripts/` — build-time codegen (page metadata, sitemap, Pagefind prerendering) and CI validation scripts
