import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './helpers';

// Fast critical-path smoke suite, run on every PR and push to main. Not the
// full 14-component regression pass (see .verify-scripts/verify.cjs and
// CI_CD.md for how to run that separately). Runs against the real
// production build (dist/) via scripts/static-server.cjs -- not vite dev,
// not vite preview -- so it exercises GitHub Pages' actual base-path and
// 404-fallback behavior, not a more forgiving dev-server approximation.

test.describe('Core application', () => {
  test('homepage loads with real content and a working topic link', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('');
    // The homepage is real content now, not a redirect -- it stays at `/`
    // and renders its own hero + topic grid (see src/components/Home.tsx).
    await expect(page).toHaveURL(/NeuralMastery-vite\/$/);
    await expect(page.locator('h1')).toBeVisible();
    const firstTopicLink = page.locator('section a').first();
    await firstTopicLink.click();
    await expect(page).toHaveURL(/\/docs\//);
    await expect(page.locator('article.prose h1').first()).toBeVisible();
    expect(errors.errors()).toEqual([]);
  });

  test('representative documentation page loads', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('docs/deep-learning/attention-demo');
    await expect(page.locator('h1')).toHaveText('Phase 1 Acceptance Test');
    expect(errors.errors()).toEqual([]);
  });

  test('desktop sidebar navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const errors = collectConsoleErrors(page);
    await page.goto('docs/getting-started/intro');
    await page.locator('.nm-sidebar a', { hasText: 'Phase 1 Acceptance Test' }).click();
    await expect(page).toHaveURL(/attention-demo/);
    await expect(page.locator('h1')).toHaveText('Phase 1 Acceptance Test');
    expect(errors.errors()).toEqual([]);
  });

  test('mobile navigation works: open, navigate, closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const errors = collectConsoleErrors(page);
    await page.goto('docs/getting-started/intro');

    await expect(page.locator('.nm-sidebar').first()).toBeHidden();
    const hamburger = page.getByRole('button', { name: 'Open navigation menu' });
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const dialog = page.getByRole('dialog', { name: 'Site navigation' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('link', { name: 'Phase 1 Acceptance Test' }).click();

    await expect(page).toHaveURL(/attention-demo/);
    await expect(dialog).toBeHidden();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 4);
    expect(errors.errors()).toEqual([]);
  });

  test('directly opening a deep link works (GitHub Pages 404-fallback)', async ({ page }) => {
    // Simulates a user pasting/refreshing a deep URL rather than navigating
    // via the app -- exactly the case scripts/copy-404.mjs exists for.
    const errors = collectConsoleErrors(page);
    const response = await page.goto('docs/deep-learning/attention-demo');
    // GitHub Pages genuinely serves this with a 404 status -- that's the
    // fallback mechanism working as intended, not a failure.
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('Phase 1 Acceptance Test');
    await page.reload();
    await expect(page.locator('h1')).toHaveText('Phase 1 Acceptance Test');
    expect(errors.errors()).toEqual([]);
  });
});

test.describe('Visualization', () => {
  test('D3 visualization renders and responds to interaction', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('docs/deep-learning/attention-demo');
    const container = page.locator('h2:has-text("A D3 Visualization") + div');
    await expect(container.locator('svg')).toBeVisible();
    expect(errors.errors()).toEqual([]);
  });

  test('React Flow visualization renders and responds to interaction', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('docs/deep-learning/attention-demo');
    const container = page.locator('h2:has-text("A React Flow Visualization") + div');
    await expect(container.locator('.react-flow__node').first()).toBeVisible();
    const nodeCount = await container.locator('.react-flow__node').count();
    expect(nodeCount).toBeGreaterThanOrEqual(8);

    const before = await container.locator('text=/chunks indexed/').innerText();
    await container.getByRole('button', { name: '30 words' }).click();
    const after = await container.locator('text=/chunks indexed/').innerText();
    expect(after).not.toBe(before);
    expect(errors.errors()).toEqual([]);
  });

  test('representative interactive ML visualization: state actually changes on interaction', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    // component-porting-check.mdx (the old Phase-1 dev scaffold this test
    // used to target) has since been removed -- visual-lab/linear-regression-studio.mdx
    // hosts the same LinearRegressionStudio component as real, permanent content.
    await page.goto('docs/visual-lab/linear-regression-studio');
    const container = page.locator('article.prose');
    await container.locator('svg').first().scrollIntoViewIfNeeded();
    await expect(container.locator('svg').first()).toBeVisible();

    await container.getByRole('button', { name: 'Gradient Descent Lab' }).click();
    const before = await container.locator('text=/^Step \\d/').innerText();
    await container.getByRole('button', { name: 'Step', exact: true }).click();
    const after = await container.locator('text=/^Step \\d/').innerText();
    expect(after).not.toBe(before);
    expect(errors.errors()).toEqual([]);
  });

  test('KaTeX math renders on a content page', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('docs/deep-learning/attention-demo');
    await expect(page.locator('.katex').first()).toBeVisible();
    expect(errors.errors()).toEqual([]);
  });

  test('Shiki-highlighted code block renders on a content page', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('docs/deep-learning/attention-demo');
    const code = page.locator('pre code, pre.shiki, pre');
    await expect(code.first()).toBeVisible();
    // Shiki inlines per-token color styles -- a plain unstyled <pre> would
    // have none of these, so this distinguishes "real syntax highlighting
    // rendered" from "a bare code block".
    const styledSpanCount = await page.locator('pre span[style*="color"]').count();
    expect(styledSpanCount).toBeGreaterThan(0);
    expect(errors.errors()).toEqual([]);
  });
});
