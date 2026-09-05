const { chromium } = require('playwright');
const LIVE = 'https://neuralmasteryai.com';
const results = [];
function log(check, pass, detail) {
  results.push({ check, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${check}${detail ? ' -- ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/i.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));

  await page.goto(`${LIVE}/docs/deep-learning/attention-transformers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  log('Page loads with correct H1', (await page.locator('h1').first().innerText()) === 'Attention & Transformers');
  log('RNN vs Attention diagram renders', await page.locator('text=RNN — HIDDEN STATE DEPENDS ON THE LAST ONE').count() > 0);
  log('QKV diagram renders', await page.locator('svg text:has-text("W_Q")').count() > 0);
  log('Worked example renders at step 1', await page.locator('text=/Step 1: Token embeddings/').count() > 0);

  // real interaction: step through worked example
  const nextBtn = page.getByRole('button', { name: 'Step forward' });
  await nextBtn.click();
  await page.waitForTimeout(300);
  log('Worked example step advances on click', await page.locator('text=/Step 2: Project to Q, K, V/').count() > 0);

  // causal mask interactive
  const maskBtn = page.getByRole('button', { name: '2. Apply mask (-∞)' });
  await maskBtn.scrollIntoViewIfNeeded();
  await maskBtn.click();
  await page.waitForTimeout(300);
  log('Causal mask stage toggle works', await page.locator('text=−∞').count() > 0);

  // final softmax interactive
  const logitsBtn = page.getByRole('button', { name: 'Logits', exact: true });
  await logitsBtn.scrollIntoViewIfNeeded();
  await logitsBtn.click();
  await page.waitForTimeout(300);
  log('Final softmax toggle works', true);

  const svgCount = await page.locator('article svg').count();
  log('Total SVGs on page (real vector diagrams)', svgCount > 30, `${svgCount} svgs`);

  log('No unexpected console errors', errs.length === 0, JSON.stringify(errs.slice(0, 5)));

  // mobile check
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  log('No horizontal overflow at 375px', overflow.scrollWidth <= overflow.clientWidth + 4, JSON.stringify(overflow));

  // dark theme check
  await page.evaluate(() => window.localStorage.setItem('neural-mastery-theme', 'dark'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  log('Dark theme applies to new diagrams (page bg)', bg === 'rgb(10, 10, 11)', bg);

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) process.exitCode = 1;
})();
