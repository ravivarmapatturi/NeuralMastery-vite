/* Real-browser verification of the actual live GitHub Pages deployment. */
const { chromium } = require('playwright');
const LIVE = 'https://neuralmasteryai.com';
const results = [];
function log(check, pass, detail) {
  results.push({ check, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${check}${detail ? ' -- ' + detail : ''}`);
}

async function main() {
  const browser = await chromium.launch();

  // ---------------- CORE (desktop) ----------------
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    const failedResources = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
    page.on('response', (r) => { if (r.status() >= 400 && r.request().resourceType() !== 'document') failedResources.push(`${r.status()} ${r.url()}`); });

    await page.goto(LIVE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    log('Homepage loads', (await page.locator('h1').count()) > 0, page.url());
    log('Homepage: no broken assets', failedResources.length === 0, JSON.stringify(failedResources.slice(0, 5)));

    // Sidebar + navigation
    const sidebarLinkCount = await page.locator('.nm-sidebar a').count();
    log('Desktop sidebar renders with real links', sidebarLinkCount > 100, `${sidebarLinkCount} links`);
    const firstMLLink = page.locator('.nm-sidebar a', { hasText: 'Linear Regression' }).first();
    await firstMLLink.click();
    await page.waitForTimeout(400);
    log('Navigation works (sidebar click)', /linear-regression/.test(page.url()), page.url());
    log('Navigated page has real H1', (await page.locator('h1').first().innerText()).length > 0);

    // Representative document
    await page.goto(`${LIVE}/docs/deep-learning/attention-transformers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const h1 = await page.locator('h1').first().innerText();
    log('Representative document loads (attention-transformers)', h1 === 'Attention & Transformers', h1);

    // KaTeX + Shiki on this same page
    const katexCount = await page.locator('.katex').count();
    log('KaTeX renders', katexCount > 50, `${katexCount} formulas`);

    // Images (ThemedImage + plain, all asset-imported)
    const brokenImgs = await page.evaluate(() => Array.from(document.querySelectorAll('article img')).filter((i) => !i.complete || i.naturalWidth === 0).length);
    const imgCount = await page.locator('article img').count();
    log('Images load with zero broken', brokenImgs === 0, `${imgCount} images, ${brokenImgs} broken`);

    log('Core desktop pass: console clean', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
    await page.close();
  }

  // ---------------- Shiki on a code-bearing page ----------------
  {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    await page.goto(`${LIVE}/docs/deep-learning/attention-demo`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const styledSpans = await page.locator('pre span[style*="color"]').count();
    log('Shiki syntax highlighting renders', styledSpans > 0, `${styledSpans} styled spans`);
    log('Shiki page console clean', errs.length === 0);
    await page.close();
  }

  // ---------------- Search (Pagefind asset reachability) ----------------
  {
    const page = await browser.newPage();
    const resp = await page.goto(`${LIVE}/pagefind/pagefind.js`);
    log('Pagefind bundle is reachable on the live site', resp.status() === 200, `status ${resp.status()}`);
  }

  // ---------------- Deep link + refresh ----------------
  {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    const resp = await page.goto(`${LIVE}/docs/machine-learning/linear-regression`, { waitUntil: 'networkidle' });
    log('Deep link direct-open status (expected 404, GH Pages fallback)', resp.status() === 404, `status ${resp.status()}`);
    const h1 = await page.locator('h1').first().innerText();
    log('Deep link renders correct page despite 404 status', h1 === 'Linear Regression, In Full Depth', h1);
    await page.reload({ waitUntil: 'networkidle' });
    const h1AfterReload = await page.locator('h1').first().innerText();
    log('Deep-link refresh still renders correctly', h1AfterReload === 'Linear Regression, In Full Depth', h1AfterReload);
    log('Deep link pass console clean', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
    await page.close();
  }

  // ---------------- Visualizations: D3, React Flow, interactive ML with real state change ----------------
  {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    await page.goto(`${LIVE}/docs/deep-learning/attention-demo`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const d3Container = page.locator('h2:has-text("A D3 Visualization") + div');
    log('D3 visualization renders', (await d3Container.locator('svg').count()) > 0);

    const rfContainer = page.locator('h2:has-text("A React Flow Visualization") + div');
    const nodeCount = await rfContainer.locator('.react-flow__node').count();
    log('React Flow visualization renders', nodeCount >= 8, `${nodeCount} nodes`);

    // real interaction + real state change on the React Flow viz
    const before = await rfContainer.locator('text=/chunks indexed/').innerText();
    await rfContainer.getByRole('button', { name: '30 words' }).click();
    await page.waitForTimeout(200);
    const after = await rfContainer.locator('text=/chunks indexed/').innerText();
    log('React Flow viz: parameter change -> real state change', before !== after, `"${before}" -> "${after}"`);

    log('Visualization page console clean', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
    await page.close();
  }

  // ---------------- Interactive ML visualization with real parameter change ----------------
  {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    await page.goto(`${LIVE}/docs/visual-lab/linear-regression-studio`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Gradient Descent Lab' }).click();
    const before = await page.locator('text=/^Step \\d/').innerText();
    await page.getByRole('button', { name: 'Step', exact: true }).click();
    const after = await page.locator('text=/^Step \\d/').innerText();
    log('Interactive ML viz (LinearRegressionStudio): real state change on interaction', before !== after, `"${before}" -> "${after}"`);
    log('Interactive ML viz page console clean', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
    await page.close();
  }

  // ---------------- Mobile navigation on the live site ----------------
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    await page.goto(`${LIVE}/docs/deep-learning/attention-transformers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    log('Mobile: docked sidebar hidden', !(await page.locator('.nm-sidebar').first().isVisible().catch(() => false)));
    const hamburger = page.getByRole('button', { name: 'Open navigation menu' });
    await hamburger.click();
    await page.waitForTimeout(300);
    const dialog = page.getByRole('dialog', { name: 'Site navigation' });
    log('Mobile menu opens on live site', await dialog.isVisible());
    const link = dialog.getByRole('link', { name: 'Linear Regression, In Full Depth' }).first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForTimeout(400);
    log('Mobile nav: real navigation works', /linear-regression/.test(page.url()), page.url());
    log('Mobile menu closed after nav', !(await dialog.isVisible().catch(() => false)));
    const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    log('Mobile: no horizontal overflow', overflow.scrollWidth <= overflow.clientWidth + 4, JSON.stringify(overflow));
    log('Mobile pass console clean', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
    await page.close();
  }

  // ---------------- Tablet responsive ----------------
  {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await page.goto(`${LIVE}/docs/machine-learning/linear-regression`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    log('Tablet: no horizontal overflow', overflow.scrollWidth <= overflow.clientWidth + 4, JSON.stringify(overflow));
    log('Tablet: hamburger visible', await page.getByRole('button', { name: 'Open navigation menu' }).isVisible());
    await page.close();
  }

  // ---------------- Themes: light, dark, page skins ----------------
  for (const { theme, skin, label } of [
    { theme: 'dark', skin: null, label: 'dark' },
    { theme: 'light', skin: null, label: 'light-default' },
    { theme: 'light', skin: 'sepia', label: 'light-sepia' },
    { theme: 'light', skin: 'sky', label: 'light-sky' },
  ]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
    await page.goto(`${LIVE}/docs/deep-learning/attention-transformers`, { waitUntil: 'networkidle' });
    await page.evaluate(({ theme, skin }) => {
      window.localStorage.setItem('neural-mastery-theme', theme);
      if (skin) window.localStorage.setItem('neural-mastery-page-theme', skin);
      else window.localStorage.removeItem('neural-mastery-page-theme');
    }, { theme, skin });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const textColor = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? getComputedStyle(h1).color : null;
    });
    log(`Theme "${label}" renders (bg vs text contrast)`, bg !== textColor && !!textColor, `bg=${bg} text=${textColor}`);
    await page.screenshot({ path: `.verify-scripts/live-${label}.png` });
    log(`Theme "${label}" console clean`, errs.length === 0, JSON.stringify(errs.slice(0, 3)));
    await page.close();
  }

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.log('FAILED:');
    failed.forEach((f) => console.log(` - ${f.check} (${f.detail})`));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('LIVE VERIFICATION SCRIPT FAILURE:', e);
  process.exit(1);
});
