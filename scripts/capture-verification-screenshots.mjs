import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PORT = 4174;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');
const ARTIFACT_DIR = '/home/ravivarma/.gemini/antigravity-cli/brain/2f777cd4-eaf2-4614-bc33-854be8ecd45d';

mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (existsSync(ARTIFACT_DIR)) {
  mkdirSync(path.join(ARTIFACT_DIR, 'screenshots'), { recursive: true });
}

// Sample realistic learner history:
// Level 23 Specialist (~24,500 XP), 12-day streak, focus in Transformers & LLMs
const SAMPLE_EVENTS = [
  // Transformers & LLMs problems
  { permalink: '/practice/scaled-dot-product-attention', kind: 'complete', date: '2026-09-10', points: 50, hintUsed: false },
  { permalink: '/practice/llm-internals-prob-1', kind: 'complete', date: '2026-09-10', points: 50, hintUsed: false },
  { permalink: '/practice/llm-internals-prob-10', kind: 'complete', date: '2026-09-09', points: 30, hintUsed: true },
  { permalink: '/practice/multi-head-attention', kind: 'complete', date: '2026-09-08', points: 100, hintUsed: false },
  { permalink: '/practice/transformer-feed-forward', kind: 'complete', date: '2026-09-07', points: 50, hintUsed: false },
  { permalink: '/practice/rotary-positional-embeddings', kind: 'complete', date: '2026-09-06', points: 150, hintUsed: false },
  { permalink: '/practice/kv-cache-optimization', kind: 'complete', date: '2026-09-05', points: 150, hintUsed: false },
  // Deep Learning problems
  { permalink: '/practice/adamw-optimizer', kind: 'complete', date: '2026-09-04', points: 50, hintUsed: false },
  { permalink: '/practice/backprop-linear', kind: 'complete', date: '2026-09-03', points: 30, hintUsed: false },
  { permalink: '/practice/conv2d-forward', kind: 'complete', date: '2026-09-02', points: 50, hintUsed: false },
  // Agents & MCP
  { permalink: '/practice/react-loop', kind: 'complete', date: '2026-09-01', points: 100, hintUsed: false },
  // System Design
  { permalink: '/practice/design-challenges/rag-pipeline', kind: 'design', date: '2026-08-30', points: 150 },
  // Lessons Understood
  { permalink: '/docs/deep-learning/attention-transformers', kind: 'mark', date: '2026-09-10', points: 10 },
  { permalink: '/docs/deep-learning/activation-functions', kind: 'mark', date: '2026-09-09', points: 10 },
  { permalink: '/docs/deep-learning/optimizers', kind: 'mark', date: '2026-09-08', points: 10 },
  { permalink: '/docs/deep-learning/training-pipeline', kind: 'mark', date: '2026-09-07', points: 10 },
  { permalink: '/docs/agents/mcp/overview', kind: 'mark', date: '2026-09-06', points: 10 },
  { permalink: '/docs/agents/protocol-deep-dive', kind: 'mark', date: '2026-09-05', points: 10 },
  // Bulk XP to reach ~24,500 points (Specialist Tier)
  { permalink: '/docs/foundation/linear-algebra', kind: 'complete', date: '2026-09-01', points: 23500 },
];

const SAMPLE_UNDERSTOOD = {
  '/docs/deep-learning/attention-transformers': { understood: true, updatedAt: Date.now() },
  '/docs/deep-learning/activation-functions': { understood: true, updatedAt: Date.now() },
  '/docs/deep-learning/optimizers': { understood: true, updatedAt: Date.now() },
  '/docs/deep-learning/training-pipeline': { understood: true, updatedAt: Date.now() },
  '/docs/agents/mcp/overview': { understood: true, updatedAt: Date.now() },
  '/docs/agents/protocol-deep-dive': { understood: true, updatedAt: Date.now() },
};

async function waitPort(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok || res.status === 404 || res.status === 200) return true;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timeout waiting for port ${port}`);
}

async function run() {
  console.log('Starting preview server...');
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'inherit',
  });

  try {
    await waitPort(PORT);
    console.log(`Preview server ready at ${BASE_URL}`);

    const browser = await chromium.launch();

    // 1. Verify prefers-reduced-motion media query suppression
    console.log('Verifying prefers-reduced-motion in browser...');
    const motionPage = await browser.newPage();
    await motionPage.emulateMedia({ reducedMotion: 'reduce' });
    await motionPage.goto(`${BASE_URL}/profile`, { waitUntil: 'domcontentloaded' });
    await motionPage.waitForTimeout(500);

    const isAnimationSuppressed = await motionPage.evaluate(() => {
      const avatarWrap = document.querySelector('.nm-avatar-float-wrap');
      if (!avatarWrap) return false;
      const computed = window.getComputedStyle(avatarWrap);
      return computed.animationName === 'none' || computed.animation === 'none';
    });

    console.log(`prefers-reduced-motion verification: Animation suppressed = ${isAnimationSuppressed}`);
    await motionPage.close();

    const targets = [
      { name: 'progress', route: '/progress' },
      { name: 'profile', route: '/profile' },
      { name: 'leaderboard', route: '/leaderboard' },
    ];

    const viewports = [
      { id: 'desktop', width: 1280, height: 900 },
      { id: 'mobile', width: 390, height: 844 },
    ];

    const themes = ['dark', 'light'];

    for (const target of targets) {
      for (const vp of viewports) {
        for (const theme of themes) {
          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            deviceScaleFactor: 2,
          });

          const page = await context.newPage();

          // Seed localStorage before navigation
          await page.addInitScript(
            ({ events, understood, theme }) => {
              window.localStorage.setItem('neural-mastery-gamification', JSON.stringify(events));
              window.localStorage.setItem('neural-mastery-progress', JSON.stringify(understood));
              window.localStorage.setItem('neural-mastery-theme', theme);
              window.localStorage.setItem('neural-mastery-display-name', 'Alex Mercer');
            },
            { events: SAMPLE_EVENTS, understood: SAMPLE_UNDERSTOOD, theme },
          );

          await page.goto(`${BASE_URL}${target.route}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1000); // Wait for transitions and content to render

          const filename = `${target.name}-${vp.id}-${theme}.png`;
          const localPath = path.join(SCREENSHOT_DIR, filename);
          await page.screenshot({ path: localPath, fullPage: false });

          if (existsSync(ARTIFACT_DIR)) {
            const artifactPath = path.join(ARTIFACT_DIR, 'screenshots', filename);
            await page.screenshot({ path: artifactPath, fullPage: false });
          }

          console.log(`Captured: ${filename} (${vp.width}x${vp.height}, ${theme})`);
          await context.close();
        }
      }
    }

    await browser.close();
    console.log('All screenshots captured successfully!');
  } finally {
    previewProcess.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
